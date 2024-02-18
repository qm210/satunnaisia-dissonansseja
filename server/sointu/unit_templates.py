from dataclasses import dataclass
from enum import Enum
from typing import Optional, List, Union, Callable


class UnitType(Enum):
    Oscillator = "oscillator"
    Envelope = "envelope"
    Filter = "filter"
    Compressor = "compressor"
    Crush = "crush"
    Distort = "distort"
    Delay = "delay"
    Noise = "noise"
    Gain = "gain"
    OutAux = "outaux"
    Out = "out"
    Hold = "hold"
    # from somewhere here these are not so relevant, qm guesses...
    Add = "add"
    AddP = "addp"
    Aux = "aux"
    Clip = "clip"
    In = "in"
    InvGain = "invgain"
    LoadNote = "loadnote"
    LoadVal = "loadval"
    Mul = "mul"
    MulP = "mulp"
    Pan = "pan"
    Pop = "pop"
    Push = "push"
    Receive = "receive"
    Send = "send"
    Speed = "speed"
    Sync = "sync"
    XCh = "xch"


@dataclass
class UnitParamTemplate:
    name: str
    min: int = 0
    max: int = 128
    # label: Optional[Union[str, Callable[[int], str]]] = None
    optional: bool = False


class UnitParamFixed(UnitParamTemplate):
    fixed = True,


class UnitParamFixedSpecial(UnitParamFixed):
    # for something like the "target" which are really stack-specific
    special = True


class UnitParamFixedBool(UnitParamFixed):
    min = 0
    max = 1


@dataclass
class UnitVarArgTemplate:
    arg_name: str
    count_name: str
    # for the delay, the var args seems to have 16-bit INT range (0..65536)
    min: int = 0
    max: int = 65536


# TODO: check again whether this might need to be refined
# also, the YML sometimes contain bullshit fields (e.g. envelope params on oscillator??)
# --> can use this to sanitize the files on saving
param_templates = {
    UnitType.Add: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.AddP: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Aux: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("gain"),
        UnitParamFixed("channel", max=6)
    ],
    UnitType.Clip: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Compressor: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("attack"),
        UnitParamTemplate("release"),
        UnitParamTemplate("invgain"),
        UnitParamTemplate("threshold"),
        UnitParamTemplate("ratio"),
    ],
    UnitType.Crush: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("resolution"),
    ],
    UnitType.Delay: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("pregain"),
        UnitParamTemplate("dry"),
        UnitParamTemplate("feedback"),
        UnitParamTemplate("damp"),
        UnitParamTemplate("notetracking", max=2),
        UnitParamFixed("reverb", max=2)
        # plus varags: "delaylines" x "delaytime"
    ],
    UnitType.Distort: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("drive"),
    ],
    UnitType.Envelope: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("attack"),
        UnitParamTemplate("decay"),
        UnitParamTemplate("sustain"),
        UnitParamTemplate("release"),
        UnitParamTemplate("gain"),
    ],
    UnitType.Filter: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("frequency"),
        UnitParamTemplate("resonance"),
        UnitParamFixedBool("lowpass"),
        UnitParamFixedBool("bandpass"),
        UnitParamFixedBool("highpass"),
        UnitParamFixedBool("negbandpass"),
        UnitParamFixedBool("neghighpass"),
    ],
    UnitType.Gain: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("gain"),
    ],
    UnitType.Hold: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("holdfreq")
    ],
    UnitType.In: [
        UnitParamFixedBool("stereo"),
        UnitParamFixed("channel", max=6)
    ],
    UnitType.InvGain: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("invgain")
    ],
    UnitType.LoadNote: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.LoadVal: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("value"),
    ],
    UnitType.Mul: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.MulP: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Noise: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("shape"),
        UnitParamTemplate("gain"),
    ],
    UnitType.Oscillator: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("transpose"),
        UnitParamTemplate("detune"),
        UnitParamTemplate("phase"),
        UnitParamTemplate("color"),
        UnitParamTemplate("shape"),
        UnitParamTemplate("gain"),
        UnitParamFixed("type", max=4),
        UnitParamFixedBool("lfo"),
        UnitParamTemplate("unison"),
        UnitParamFixed("samplestart", optional=True),  # only for type == 4 (Sample)
        UnitParamFixed("loopstart", optional=True),  # only for type == 4 (Sample)
    ],
    UnitType.Out: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("gain"),
    ],
    UnitType.OutAux: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("outgain"),
        UnitParamTemplate("auxgain"),
    ],
    UnitType.Pan: [
        UnitParamFixedBool("stereo"),
        UnitParamFixed("panning"),  # could make variable, but would one randomize that..?
    ],
    UnitType.Pop: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Push: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Receive: [
        UnitParamFixedBool("stereo"),
    ],
    UnitType.Send: [
        UnitParamFixedBool("stereo"),
        UnitParamTemplate("amount"),
        UnitParamFixed("voice", max=32),
        UnitParamFixedSpecial("target"),  # this is actually
        UnitParamFixed("port", max=7),
        UnitParamFixedBool("sendpop"),
    ],
    UnitType.Speed: [],
    UnitType.Sync: [],
    UnitType.XCh: [
        UnitParamFixedBool("stereo"),
    ],
}

var_arg_templates = {
    UnitType.Delay: UnitVarArgTemplate("delaytime", "delaylines"),
}

all_defined_params = {
    type: [param.name for param in params]
    for type, params in param_templates.items()
}


@dataclass
class UnitTemplate:
    name: str
    all_params: List[str]
    param_templates: List[UnitParamTemplate]
    var_args: Optional[UnitVarArgTemplate]


def collect_all_unit_templates() -> List[UnitTemplate]:
    return [UnitTemplate(
        unit_type.value,
        all_defined_params[unit_type],
        param_templates.get(unit_type, []),
        var_arg_templates.get(unit_type)
    ) for unit_type in UnitType]
