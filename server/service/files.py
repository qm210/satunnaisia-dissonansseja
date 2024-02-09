import string
from pathlib import Path
from typing import Optional


class FilesService:
    def __init__(self, config, rating_repository):
        # this should only hold constant configuration information
        # no state on a request basis!
        self.wav_folder = config["wav"]["folder"]
        self.rating_repository = rating_repository

    def get_all_wavs(self):
        folder = Path(self.wav_folder)
        result = {}
        for item in folder.glob("**/*.wav"):
            file = item.relative_to(folder)
            tag = '/'.join(file.parts[:-1]) \
                if len(file.parts) > 1 else ""
            file_info = {
                'path': item.as_posix(),
                'name': str(file.parts[-1].split(".")[0]),
                'tag': tag
            }
            if tag not in result:
                result[tag] = []
            result[tag].append(file_info)

        return list(map(
            lambda t: {'tag': t[0], 'files': t[1]},
            result.items()
        ))

    def get_unrated_wavs_for(self, username: string):
        all_rated = self.rating_repository.query_rated_by(username)
        all_wavs = self.get_all_wavs()
        return all_wavs

    def get_single_wav_path(self, file: string) -> Optional[string]:
        result = Path(self.wav_folder) / Path(file)
        return result.resolve() if result.exists() else None
