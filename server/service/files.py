import string
from pathlib import Path


class FilesService:
    wav_folder: string = "wav"

    def __init__(self, app, db, **kwargs):
        # this should only hold constant configuration information
        # no state on a request basis!
        self.app = app
        self.db = db
        self.wav_folder = kwargs.get("wav_folder", self.wav_folder)

    def get_all_wavs(self):
        folder = Path(self.wav_folder)
        result = {}
        for item in folder.glob("**/*.wav"):
            file = item.relative_to(folder)
            self.app.logger.debug(f"Subfolder: {file.parts}, {file.parts[-1]} / {file.parts[0]}")
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
