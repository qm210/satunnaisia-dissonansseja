from dataclasses import dataclass
from pathlib import Path
from typing import List, Union, Optional

from server.utils.error import SointuCompileError, AssemblerError, LinkerError


@dataclass
class SointuCommand:
    command: List[str]
    raise_on_error: Optional[Exception]
    shell: bool = False

    def __init__(self, commands: List[Union[str, Path, int]], **kwargs):
        self.command = [str(command) for command in commands]
        self.raise_on_error = kwargs.get('raise_on_error')
        self.shell = kwargs.get('shell', False)

    def __str__(self) -> str:
        return " ".join(map(lambda c: str(c), self.command))

    @classmethod
    def compile_yml(cls, sointu_path: Path, track_asm_file: Path, yaml_file: Path):
        return cls(
            [
                sointu_path,
                '-arch', '386',
                '-e', 'asm,inc',
                '-o', track_asm_file,
                yaml_file,
            ],
            raise_on_error=SointuCompileError(f"Could not compile track: {yaml_file}")
        )

    @classmethod
    def assemble_wav_writer(cls, asm_path: Path, include_dir: Path, wav_asm_file: Path, music_inc_file: Path,
                            wav_file: Path, wav_obj_file: Path):
        return cls(
            [
                asm_path,
                '-f', 'win32',
                '-I', include_dir,
                wav_asm_file,
                f'-DTRACK_INCLUDE="{music_inc_file}"',
                f'-DFILENAME="{wav_file}"',
                '-o', wav_obj_file,
            ],
            raise_on_error=AssemblerError(f"Could not assemble track: {wav_asm_file}")
        )

    @classmethod
    def assemble_track(cls, asm_path: Path, include_dir: Path, track_asm_file: Path, track_obj_file: Path):
        return cls(
            [
                asm_path,
                '-f', 'win32',
                '-I', include_dir,
                track_asm_file,
                '-o', track_obj_file,
            ]
        )

    @classmethod
    def link_wav_writer(cls, crinkler_path: Path, include_dir: Path, win_sdk_lib_path: Path, wav_obj_file: Path,
                        track_obj_file: Path, wav_exe: Path):
        # Note: When using the list based api, quotes in arguments
        # are not escaped properly. How annoying can it get?!
        return cls(
            [
                crinkler_path,
                f'/LIBPATH:"{include_dir}"',
                f'/LIBPATH:"{win_sdk_lib_path}"',
                wav_obj_file,
                track_obj_file,
                f'/OUT:{wav_exe}',
                'Winmm.lib',
                'Kernel32.lib',
                'User32.lib',
            ],
            shell=True,
            raise_on_error=LinkerError(f"Unable to link {wav_exe}")
        )
