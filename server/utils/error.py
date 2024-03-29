class SointuCompileError(Exception):
    pass


class AssemblerError(Exception):
    pass


class LinkerError(Exception):
    pass


class WavWriterError(Exception):
    pass


class InstrumentFormatError(Exception):
    pass


class InstrumentConfigNotPersisted(Exception):
    pass
