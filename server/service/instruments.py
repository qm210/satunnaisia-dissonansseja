from pathlib import Path

from server.sointu.error import InstrumentFormatError
from server.sointu.instrument import Instrument
from server.sointu.unit_templates import collect_all_unit_templates
from server.utils.files import read_subfolders_as_tags


class InstrumentsService:
    """
    This service is the one dealing with the yml files to randomize and put into sointu.
    """

    def __init__(self, config, logger, sointu_service):
        self.folder = Path(config["instruments"]["folder"])
        self.logger = logger
        self.sointu_service = sointu_service
        self._all_unit_templates = collect_all_unit_templates()

    def get_all_ymls(self):
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

            entry["instrument"] = {
                **instrument.serialize(),
                "units": self.merge_units_into_templates(instrument.units)
            }
            result.append(entry)

        return result

    @property
    def all_unit_templates(self):
        return self._all_unit_templates

    def merge_units_into_templates(self, units):
        result = []
        for unit in units:
            template = next(
                (t for t in self._all_unit_templates if t.name == unit.type),
                None
            )
            if template is None:
                continue

            parameters = []
            for param_name in template.all_params:
                value = unit.parameters.get(param_name)
                if value is None:
                    continue

                parameters.append({
                    "name": param_name,
                    "value": value,
                    "originalValue": value,
                    "template": next(
                        (t for t in template.param_templates if t.name == param_name),
                        None
                    ),
                    "range": None
                })

            result.append({
                **unit.serialize(),
                'parameters': parameters
            })
        return result
