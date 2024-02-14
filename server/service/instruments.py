from pathlib import Path

from server.sointu.error import InstrumentFormatError
from server.sointu.instrument import Instrument
from server.utils.files import read_subfolders_as_tags


class InstrumentsService:
    """
    This service is the one dealing with the yml files to randomize and put into sointu.
    """

    def __init__(self, config, logger, sointu_service):
        self.folder = Path(config["instruments"]["folder"])
        self.logger = logger
        self.sointu_service = sointu_service

    def get_all(self):
        result = []
        for yml_file in self.folder.glob('*.yml'):
            entry = {
                "file": yml_file.name,
                "error": None,
                "instrument": None,
            }
            try:
                instrument = Instrument.parse_file(yml_file)
            except InstrumentFormatError as ex:
                entry["error"] = str(ex)
                continue

            entry["instrument"] = instrument
            result.append(entry)

        return result
