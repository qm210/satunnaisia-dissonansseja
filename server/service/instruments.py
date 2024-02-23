from pathlib import Path
from typing import Optional

from server.model.instrument_config import InstrumentConfig
from server.model.instrument_run import InstrumentRun
from server.model.param_config import ParamConfig, ParamConfigWithTemplate
from server.sointu.error import InstrumentFormatError
from server.sointu.instrument import Instrument
from server.sointu.unit_templates import collect_all_unit_templates
from server.utils.files import calc_file_hash


class InstrumentsService:
    """
    This service is the one dealing with the instruments, based on Sointu yml files, to randomize and put into Sointu.

    There are two steps:
     1. New YML files from the "instruments" folder are the base instruments.
        They are sent to the client so the user can do first configurations on them.
     2. They then get stored in the DB in the "instrument config" table.
        These are more refined as the base YML, i.e. take precedence

    TODO: make it possible to store multiple instrument configs to a base YMLs, or to make clones, etc.
    """

    def __init__(self, config, logger, sointu_service, instrument_config_repository):
        self.folder = Path(config["instruments"]["folder"])
        self.logger = logger
        self.sointu_service = sointu_service
        self.instrument_config_repository = instrument_config_repository

        self._all_unit_templates = collect_all_unit_templates()

    def get_all(self):
        base_instruments = self.get_base_instruments()
        return self.get_merged_instrument_configs(base_instruments)

    def get_merged_instrument_configs(self, base_instruments):
        """
        Current logic is as follows:
        - new instruments get there by having a .yml in the instruments/ folder.
        - if there is no entry in the DB with that file hash, give it out as a new config
        - if, instead, there are entries in the DB with that file hash, give these out as a new config
              but then ignore the base YML.
              -> If this changes, the hash changes, and then that's not ignored anymore..
        """
        instrument_configs = self.instrument_config_repository.get_all()
        known_hashes = [
            config.base_yml_hash
            for config in instrument_configs
        ]
        for yml in base_instruments:
            if yml['baseYmlHash'] in known_hashes:
                continue
            instrument_configs.append(
                InstrumentConfig.from_json(yml, keep_params_configs=True)
            )
        return instrument_configs

    def get_base_instruments(self):
        result = []
        for yml_file in self.folder.glob('*.yml'):
            entry = {
                "baseYmlFilename": yml_file.name,
                "baseYmlHash": calc_file_hash(yml_file),
                "baseInstrument": None,
            }
            try:
                instrument = Instrument.parse_file(yml_file)
            except InstrumentFormatError as ex:
                self.logger.warn(f"Error in parse_file {yml_file}: {ex}")
                continue

            entry["baseInstrument"] = instrument.serialize(use_templates=self.all_unit_templates)

            entry["paramsConfig"] = self.build_params_config_with_templates(instrument.units)

            result.append(entry)

        return result

    @property
    def all_unit_templates(self):
        return self._all_unit_templates

    def build_params_config_with_templates(self, units):
        result = []
        for unit in units:
            unit_template = next(
                (t for t in self.all_unit_templates if t.name == unit.type),
                None
            )
            if unit_template is None:
                continue

            for param_name in unit_template.all_params:
                param = unit.get_parameter(param_name)
                if param is None:
                    continue

                param_template = next(
                    (t for t in unit_template.param_templates if t.name == param_name),
                    None
                )
                config_with_template = ParamConfigWithTemplate.parse_from(
                    unit,
                    param,
                    template=param_template
                )
                result.append(config_with_template)

        return result

    def store_instrument_config(self, json):
        config = InstrumentConfig.from_json(json)
        self.instrument_config_repository.upsert(config)

    def prepare_run(self, json) -> Optional[InstrumentRun]:
        print("TODO: PREPARE INSTRUMENT RUN", json, "and return it")
        return InstrumentRun()
