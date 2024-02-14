from collections.abc import Generator
from typing import Dict, Optional

from server.sointu.dependency import (
    Dependency,
)
from subprocess import run
from tempfile import TemporaryDirectory
from pathlib import Path
from winreg import (
    ConnectRegistry,
    OpenKey,
    HKEY_LOCAL_MACHINE,
    HKEYType,
    QueryValueEx,
)

from server.sointu.error import SointuCompileError, AssemblerError, LinkerError, WavWriterError
from server.sointu.downloader import Downloader
from server.sointu.instrument import Instrument
from yaml import safe_load, dump

from server.sointu.sointu_message import SointuMessage

# Wow, I can not begin to comprehend how an unsuitable Moloch like
# the Windows registry is considered useful by some individuals.
# I do not want to write or maintain any of the bloated code below.
registry: HKEYType = ConnectRegistry(None, HKEY_LOCAL_MACHINE)
windowsSdkKey: HKEYType = OpenKey(registry, r'SOFTWARE\WOW6432Node\Microsoft\Microsoft SDKs\Windows\v10.0')
windowsSdkProductVersion, _ = QueryValueEx(windowsSdkKey, r'ProductVersion')
windowsSdkInstallFolder, _ = QueryValueEx(windowsSdkKey, r'InstallationFolder')
windowsSdkKey.Close()
registry.Close()
WindowsSdkLibPath: Path = Path(windowsSdkInstallFolder) / 'Lib' / '{}.0'.format(windowsSdkProductVersion) / 'um' / 'x86'


class Sointu:
    @staticmethod
    def run_and_yield_output(*args, print_debug=False, raise_on_error=None, **kwargs) -> Generator[SointuMessage]:
        if print_debug:
            cmd = args[0] if isinstance(args[0], str) else " ".join(args[0])
            yield SointuMessage.Log(cmd)

        result = run(*args, **kwargs, capture_output=True, text=True)
        for line in result.stdout.splitlines():
            yield SointuMessage.Log(line + '\n')

        if raise_on_error is not None and result.returncode != 0:
            raise raise_on_error
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
    def yamlToWave(yaml: str, deps: Dict[Dependency, Path], wav_asm_file: Path) -> Generator[SointuMessage]:
        outputDirectory: TemporaryDirectory = TemporaryDirectory()

        # Write yaml file.
        yaml_file: Path = Path(outputDirectory.name) / 'music.yml'
        yaml_file.write_text(yaml)

        # Compile yaml file using sointu.
        track_asm_file: Path = Path(outputDirectory.name) / 'music.asm'
        for message in Sointu.run_and_yield_output(
                [
                    deps[Dependency.Sointu],
                    '-arch', '386',
                    '-e', 'asm,inc',
                    '-o', track_asm_file,
                    yaml_file,
                ],
                raise_on_error=SointuCompileError('Could not compile track: {}.'.format(yaml_file))
        ):
            if isinstance(message, SointuMessage.Log):
                yield message

        # Assemble the wav writer.
        wav_obj_file: Path = Path(outputDirectory.name) / 'wav.obj'
        wav_file: Path = Path(outputDirectory.name) / 'music.wav'
        for message in Sointu.run_and_yield_output(
                [
                    deps[Dependency.Nasm],
                    '-f', 'win32',
                    '-I', Path(outputDirectory.name),
                    wav_asm_file,
                    '-DTRACK_INCLUDE="{}"'.format(Path(outputDirectory.name) / 'music.inc'),
                    '-DFILENAME="{}"'.format(wav_file),
                    '-o', wav_obj_file,
                ],
                raise_on_error=AssemblerError('Could not assemble track: {}.'.format(wav_asm_file))
        ):
            if isinstance(message, SointuMessage.Log):
                yield message

        # Assemble track.
        track_obj_file: Path = Path(outputDirectory.name) / 'music.obj'
        for message in Sointu.run_and_yield_output(
                [
                    deps[Dependency.Nasm],
                    '-f', 'win32',
                    '-I', Path(outputDirectory.name),
                    track_asm_file,
                    '-o', track_obj_file,
                ]
        ):
            if isinstance(message, SointuMessage.Log):
                yield message

        # Link wav writer.
        # Note: When using the list based api, quotes in arguments
        # are not escaped properly. How annoying can it get?!
        wav_exe = Path(outputDirectory.name) / 'wav.exe'
        for message in Sointu.run_and_yield_output(
                ' '.join(map(str, [
                    deps[Dependency.Crinkler],
                    '/LIBPATH:"{}"'.format(Path(outputDirectory.name)),
                    '/LIBPATH:"{}"'.format(WindowsSdkLibPath),
                    wav_obj_file,
                    track_obj_file,
                    '/OUT:{}'.format(wav_exe),
                    'Winmm.lib',
                    'Kernel32.lib',
                    'User32.lib',
                ])),
                shell=True,
                raise_on_error=LinkerError('Unable to link {}.'.format(wav_exe))
        ):
            if isinstance(message, SointuMessage.Log):
                yield message

        # Write wave file
        for message in Sointu.run_and_yield_output(
                [
                    wav_exe,
                ],
                raise_on_error=WavWriterError('Unable to write wav {}.'.format(wav_file))
        ):
            if isinstance(message, SointuMessage.Log):
                yield message

        yield SointuMessage.WavResult(wav_file.read_bytes())


if __name__ == '__main__':
    downloader = Downloader()

    relative_template_path = "../templates"

    templates = (Path(__file__).parent / relative_template_path).resolve()
    instrument: Instrument = Instrument.parse_file(templates / 'instrument.yml')
    sequenceObject = safe_load((templates / 'sequence.yml').read_text())
    sequenceObject['patch'] = [instrument.serialize()] + sequenceObject['patch']
    print(dump(sequenceObject, indent=2))

    result = Sointu.print_logs_until_wav_result(Sointu.yamlToWave(
        dump(sequenceObject),
        downloader.dependencies,
        templates / "wav.asm"
    ))
    if result is None:
        print("No Wav Result returned.")
    else:
        (templates / 'test.wav').write_bytes(result)

    # print(instrument.randomize())
    # print(
    #     Sointu.yamlToWave(
    #         Path(files(templates) / '21.yml').read_text(),
    #         downloader.dependencies
    #     )
    # )