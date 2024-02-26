from collections.abc import Generator
from typing import Dict, Optional, List, Tuple, Union

from server.sointu import templates_path, win_sdk_lib_path
from server.sointu.dependency import Dependency
from subprocess import run
from tempfile import TemporaryDirectory
from pathlib import Path

from server.utils.error import WavWriterError
from server.sointu.downloader import Downloader
from server.sointu.instrument import Instrument
from yaml import safe_load, dump

from server.sointu.sointu_command import SointuCommand
from server.sointu.sointu_message import SointuMessage


class Sointu:

    @staticmethod
    def run_and_yield(cmd: Union[SointuCommand, List], print_debug=False) -> Generator[SointuMessage]:
        if print_debug:
            yield SointuMessage.Log(cmd)

        if isinstance(cmd, list):
            cmd = SointuCommand(cmd)

        result = run(cmd.command, shell=cmd.shell, capture_output=True, text=True)
        for line in result.stdout.splitlines():
            yield SointuMessage.Log(line + '\n')

        if cmd.raise_on_error and result.returncode != 0:
            raise cmd.raise_on_error
        yield SointuMessage.RunReturnCode(result.returncode)

    @staticmethod
    def print_logs_until_wav_result(generator: Generator[SointuMessage]) -> Optional[bytes]:
        while True:
            try:
                result = next(generator)
                if isinstance(result, SointuMessage.Log):
                    print(result, end='')
                if isinstance(result, SointuMessage.WavResult):
                    return result.payload
            except StopIteration:
                return None

    @staticmethod
    def create_commands_for_wav_writing(
            temp_path: Path,
            deps: Dict[Dependency, Path],
            wav_asm_file: Path,
            suffix: str = ""
    ) -> Tuple[List[SointuCommand], Path, Path]:
        def temp_file(filename: str):
            path = temp_path / filename
            path = path.with_stem(path.stem + suffix)
            return path

        yaml_file = temp_file('music.yml')
        track_asm_file = temp_file('music.asm')
        music_inc_file = temp_file('music.inc')
        wav_obj_file = temp_file('wav.obj')
        wav_file = temp_file('music.wav')
        track_obj_file = temp_file('music.obj')
        wav_exe = temp_file('wav.exe')

        commands = [
            SointuCommand.compile_yml(
                deps[Dependency.Sointu],
                track_asm_file,
                yaml_file
            ),
            SointuCommand.assemble_wav_writer(
                deps[Dependency.Nasm],
                temp_path,
                wav_asm_file,
                music_inc_file,
                wav_file,
                wav_obj_file
            ),
            SointuCommand.assemble_track(
                deps[Dependency.Nasm],
                temp_path,
                track_asm_file,
                track_obj_file
            ),
            SointuCommand.link_wav_writer(
                deps[Dependency.Crinkler],
                temp_path,
                win_sdk_lib_path,
                wav_obj_file,
                track_obj_file,
                wav_exe
            ),
            SointuCommand(
                [wav_exe],
                raise_on_error=WavWriterError(f"Unable to write wav {wav_file}")
            )
        ]

        return commands, yaml_file, wav_file

    @staticmethod
    def write_wav_file(
            sequence: dict,
            deps: Dict[Dependency, Path],
            wav_asm_file: Path,
            suffix: str = ""
    ) -> Generator[SointuMessage]:
        with TemporaryDirectory() as tmp_dir:
            commands, yaml_file, wav_file = (
                Sointu.create_commands_for_wav_writing(
                    Path(tmp_dir),
                    deps,
                    wav_asm_file,
                    suffix
                )
            )

            yaml_file.write_text(dump(sequence))

            for command in commands:
                for message in Sointu.run_and_yield(command):
                    if isinstance(message, SointuMessage.Log):
                        yield message

            yield SointuMessage.WavResult(wav_file.read_bytes())

    # @staticmethod
    # def write_


if __name__ == '__main__':
    downloader = Downloader()

    instrument: Instrument = Instrument.parse_file(templates_path / 'instrument.yml')

    sequenceObject = safe_load((templates_path / 'sequence.yml').read_text())
    sequenceObject['patch'] = [instrument.serialize()] + sequenceObject['patch']
    print(dump(sequenceObject, indent=2))

    result = Sointu.print_logs_until_wav_result(
        Sointu.write_wav_file(
            sequenceObject,
            downloader.dependencies,
            templates_path / "wav.asm"
        ))
    if result is None:
        print("No Wav Result returned.")
    else:
        (templates_path / 'test.wav').write_bytes(result)

    # print(instrument.randomize())
    # print(
    #     Sointu.yamlToWave(
    #         Path(files(templates) / '21.yml').read_text(),
    #         downloader.dependencies
    #     )
    # )
