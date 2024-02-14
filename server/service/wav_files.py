import string
from pathlib import Path
from typing import Optional, List

from server.utils.files import read_subfolders_as_tags


class WavFilesService:
    """
    This service is the one dealing with the _output_ files from sointu.
    i.e. to handle what sointu has written and give it to the rating api
    """

    def __init__(self, config, rating_repository):
        # this should only hold constant configuration information
        # no state on a request basis!
        self.wav_folder = Path(config["wav"]["folder"])
        self.rating_repository = rating_repository

    def get_all_wavs(self, except_files: Optional[List[string]] = None):
        return read_subfolders_as_tags(self.wav_folder, "*.wav", except_files)

    def get_unrated_wavs_for(self, username: string):
        all_rated = [
            rating.file for rating in
            self.rating_repository.query_rated_by(username)
        ]
        return self.get_all_wavs(except_files=all_rated)

    def get_single_wav_path(self, file: string) -> Optional[string]:
        result = self.wav_folder / Path(file)
        return result.resolve() if result.exists() else None
