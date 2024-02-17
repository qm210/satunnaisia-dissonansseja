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
    default: int = 64
    min: int = 0
    max: int = 128
    label: Optional[Union[str, Callable[[int], str]]] = None


@dataclass
class UnitVarArgTemplate:
    arg_name: str
    count_name: str
    # for the delay, the var args seems to have 16-bit INT range (0..65536)
    min: int = 0
    max: int = 65536


varying_param_templates = {
    UnitType.Oscillator: [
        UnitParamTemplate("transpose"),
        UnitParamTemplate("detune"),
        UnitParamTemplate("phase", default=0),
        UnitParamTemplate("color"),
        UnitParamTemplate("shape"),
        UnitParamTemplate("gain"),
        UnitParamTemplate("unison", default=0),
    ],
    UnitType.Noise: [
        UnitParamTemplate("shape"),
        UnitParamTemplate("gain"),
    ],
    UnitType.Envelope: [
        UnitParamTemplate("attack"),
        UnitParamTemplate("decay"),
        UnitParamTemplate("sustain"),
        UnitParamTemplate("release"),
        UnitParamTemplate("gain"),
    ],
    UnitType.Filter: [
        UnitParamTemplate("frequency"),
        UnitParamTemplate("resonance"),
    ],
    UnitType.Compressor: [
        UnitParamTemplate("attack"),
        UnitParamTemplate("release"),
        UnitParamTemplate("invgain"),
        UnitParamTemplate("threshold"),
        UnitParamTemplate("ratio"),
    ],
    UnitType.Crush: [
        UnitParamTemplate("resolution"),
    ],
    UnitType.Distort: [
        UnitParamTemplate("drive"),
    ],
    UnitType.Delay: [
        UnitParamTemplate("pregain"),
        UnitParamTemplate("dry"),
        UnitParamTemplate("feedback"),
        UnitParamTemplate("damp"),
        UnitParamTemplate("notetracking", max=2),
    ],
    UnitType.OutAux: [
        UnitParamTemplate("outgain"),
        UnitParamTemplate("auxgain"),
    ],
    UnitType.Gain: [
        UnitParamTemplate("gain"),
    ],
    UnitType.Hold: [
        UnitParamTemplate("holdfreq")
    ],
    # TODO: complete this
}

var_arg_templates = {
    UnitType.Delay: UnitVarArgTemplate("delaytime", "delaylines"),
}

# TODO: the thing below is not complete yet
# e.g. the "stereo" / "lfo" are not meant to be variable, but it still would be better
# for the client to know that these are bools, to display the disabled sliders.

# use this to match the correct order as seen in Sointu
# also, because the YML sometimes contain bullshit fields (e.g. envelope params on oscillator??)
all_defined_params = {
    UnitType.Add: [
        "stereo"
    ],
    UnitType.AddP: [
        "stereo"
    ],
    UnitType.Aux: [
        "stereo",
        "gain",
        "channel"
    ],
    UnitType.Clip: [
        "stereo"
    ],
    UnitType.Compressor: [
        "stereo",
        "attack",
        "release",
        "invgain",
        "threshold",
        "ratio"
    ],
    UnitType.Crush: [
        "stereo",
        "resolution"
    ],
    UnitType.Delay: [
        "stereo",
        "pregain",
        "dry",
        "feedback",
        "damp",
        "notetracking",
        "reverb",
        # plus varags: "delaylines" x "delaytime"
    ],
    UnitType.Distort: [
        "stereo",
        "drive",
    ],
    UnitType.Envelope: [
        "stereo",
        "attack",
        "decay",
        "sustain",
        "release",
        "gain"
    ],
    UnitType.Filter: [
        "stereo",
        "frequency",
        "resonance",
        "lowpass",
        "bandpass",
        "highpass",
        "negbandpass",
        "neghighpass",
    ],
    UnitType.Gain: [
        "stereo",
        "gain",
    ],
    UnitType.Hold: [
        "stereo",
        "holdfreq"
    ],
    UnitType.In: [
        "stereo",
        "channel"
    ],
    UnitType.InvGain: [
        "stereo",
        "invgain"
    ],
    UnitType.LoadNote: [
        "stereo"
    ],
    UnitType.LoadVal: [
        "stereo",
        "value"
    ],
    UnitType.Mul: [
        "stereo"
    ],
    UnitType.MulP: [
        "stereo"
    ],
    UnitType.Noise: [
        "stereo",
        "shape",
        "gain"
    ],
    UnitType.Oscillator: [
        "stereo",
        "transpose",
        "detune",
        "phase",
        "color",
        "shape",
        "gain",
        "type",  # wouldn't know how to include the "3 / Gate" and "4 / Sample" options
        "lfo",
        "unison",
        "samplestart",  # optional for type == 4
        "loopstart"  # optional for type == 4
    ],
    UnitType.Out: [
        "stereo",
        "gain"
    ],
    UnitType.OutAux: [
        "stereo",
        "outgain",
        "mixgain",
    ],
    UnitType.Pan: [
        "stereo",
        "panning"
    ],
    UnitType.Pop: [
        "stereo"
    ],
    UnitType.Push: [
        "stereo"
    ],
    UnitType.Receive: [
        "stereo"
    ],
    UnitType.Send: [
        "stereo",
        "amount",
        "voice",
        "target",
        "port",
        "sendpop",
    ],
    UnitType.Speed: [],
    UnitType.Sync: [],
    UnitType.XCh: [
        "stereo"
    ]
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
        varying_param_templates.get(unit_type, []),
        var_arg_templates.get(unit_type)
    ) for unit_type in list(UnitType)]
