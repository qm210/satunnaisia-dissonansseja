import {
    Component,
    InstrumentConfig,
    BaseUnit,
    BaseParameter,
    WithInit, UnitParameterConfig, InstrumentConfigId
} from "../types";
import Alpine from "alpinejs";

const INSTRUMENTS_ENDPOINT = "/api/sointu/instrument";

// describes one param (valid only per baseInstrument - else, unitId might differ!) uniquely
type ParameterDescriptor = Pick<UnitParameterConfig, "unitId" | "paramName">;

type FixedByUserRecord =
    Record<InstrumentConfigId, ParameterDescriptor[]>;

type InstrumentData = {
    all: { [file: string]: InstrumentConfig },
    isLoading: boolean,
    load: () => void,
    isSubmitting: boolean,
    submit: (file: InstrumentConfig) => void,
    discard: (file: InstrumentConfig) => void,
    extendRanges: (instrumentId: InstrumentConfigId) => void,
    contractRanges: (instrumentId: InstrumentConfigId) => void,
    isChanged: InstrumentConfigId[],
    hasRange: InstrumentConfigId[],
    fixedByUser: FixedByUserRecord,
    analyzeDebounce?: number | undefined,
}

// don't wanna extend this shit elsewhere, just monkey-patch it here for now.
declare global {
    interface Window {
        contractParamRange: (param: UnitParameterConfig) => void,
        extendParamRange: (param: UnitParameterConfig) => void,
        toggleAllParametersVariable: (yml: InstrumentConfig, value: boolean) => void,
        paramIsOriginal: (param: UnitParameterConfig) => boolean,
    }
}

// works because these are integer values, but these are Proxies
// i.e. param.value !== param.originalValue unless explicitly set
// but calculating the difference reduces it to a primitive integer value
window.paramIsOriginal = (param: UnitParameterConfig) =>
    param.value - param.originalValue === 0;


const analyzeState = (data: Component<InstrumentData>) => (current: InstrumentConfig[]) => {
    if (data.analyzeDebounce) {
        clearTimeout(data.analyzeDebounce);
    }
    data.analyzeDebounce = setTimeout(() => {
        data.analyzeDebounce = undefined;
        data.isChanged = [];
        data.hasRange = [];
        for (const item of Object.values(current)) {
            const anyRangeDefined = item.paramsConfig
                .some(p => p.range);
            const anyValueChanged = item.paramsConfig
                .some(p =>
                    !window.paramIsOriginal(p as any)
                );
            if (anyRangeDefined) {
                data.hasRange.push(item.id);
                data.isChanged.push(item.id);
            } else if (anyValueChanged) {
                data.isChanged.push(item.id);
            }
        }
    }, 150);
};

const allVariableParametersFor = (file: InstrumentConfig) =>
    file.paramsConfig
        .filter(p => !p.template.fixed);

const matchesParam = (p1: ParameterDescriptor) =>
    (p2: ParameterDescriptor) =>
        p1.paramName === p2.paramName &&
        p1.unitId === p2.unitId;

const isNotFixedByUser = (fixedByUser: ParameterDescriptor[]) =>
    (p: UnitParameterConfig) =>
        !fixedByUser.find(matchesParam(p));

const currentlyVariableParametersFor = (file: InstrumentConfig, fixedByUserRecord: FixedByUserRecord) =>
    allVariableParametersFor(file)
        .filter(isNotFixedByUser(fixedByUserRecord[file.id]));

const EXPAND_FACTOR = 0.1;
const CONTRACT_FACTOR = 0.2;

window.contractParamRange = (param: UnitParameterConfig) => {
    if (!param.range) {
        return;
    }
    const span = param.range[1] - param.range[0];
    if (span < 4) {
        param.range = null;
    } else {
        const lowerSpan = param.value - param.range[0];
        const upperSpan = param.range[1] - param.value;
        param.range = [
            param.range[0] + CONTRACT_FACTOR * lowerSpan,
            param.range[1] - CONTRACT_FACTOR * upperSpan
        ];
    }
};

window.extendParamRange = (param: UnitParameterConfig) => {
    if (!param.range) {
        param.range = [param.value, param.value];
    }
    const lowerSpan = param.range[0] - param.template.min;
    const upperSpan = param.template.max - param.range[1];
    param.range = [
        Math.max(
            Math.floor(
                param.range[0] - EXPAND_FACTOR * lowerSpan
            ),
            param.template.min
        ),
        Math.min(
            Math.ceil(
                param.range[1] + EXPAND_FACTOR * upperSpan
            ),
            param.template.max
        )
    ];
};

const toggleFixedByUser = (param: UnitParameterConfig, instr: InstrumentConfig, fixedByUserRecord: FixedByUserRecord, isNowFixed: boolean) => {
    fixedByUserRecord[instr.id] = fixedByUserRecord[instr.id]
        .filter(pd => !matchesParam(param)(pd));

    if (!isNowFixed) {
        return;
    }
    fixedByUserRecord[instr.id].push({
        paramName: param.paramName,
        unitId: param.unitId
    });
};

const looksLikeEnum = (param: UnitParameterConfig) =>
    param.template.max < 10;

const initFixedByUser = (fixedByUser: FixedByUserRecord, instrumentConfig: InstrumentConfig) => {
    fixedByUser[instrumentConfig.id] = [];
    for (const param of instrumentConfig.paramsConfig) {
        if (param.template.fixed) {
            // if the param is really fixed anyway, the fixedByUser won't help it either
            continue;
        }
        const fixedByDefault = looksLikeEnum(param);
        toggleFixedByUser(param, instrumentConfig, fixedByUser, fixedByDefault);
    }
};

Alpine.data("instruments", (): WithInit<InstrumentData> => ({
    all: {},
    isChanged: [],
    hasRange: [],
    fixedByUser: {},
    isLoading: true,
    isSubmitting: false,

    init: function(this: Component<InstrumentData>) {
        this.load();
        this.$watch("all", analyzeState(this));
    },

    load: function(this: Component<InstrumentData>) {
        this.isLoading = true;
        window.fetchJson(INSTRUMENTS_ENDPOINT)
            .then((response) => {
                this.all = {};
                for (const entry of response) {
                    this.all[entry.id] = entry;
                    initFixedByUser(this.fixedByUser, entry);
                }
                this.$store.sointu.undoStack = []; // not implemented yet, sorriiiiiie..!!11iii111iieee..!1
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    submit: function(this: Component<InstrumentData>, file: InstrumentConfig) {
        window.postJson(INSTRUMENTS_ENDPOINT, file)
            .then(console.log);
    },

    discard: function(this: Component<InstrumentData>, instrumentConfig: InstrumentConfig) {
        // TODO: backend needs function just to reload this file
        // or even better, solve this via the upcoming UNDO function instead of refetch

        // note: cursor only changes if mouse actually moves
        // don't care for now, I thought I might like the effect
        document.body.classList.add("waiting");

        window.fetchJson(INSTRUMENTS_ENDPOINT)
            .then((res: InstrumentConfig[]) => {
                const entry = res.find(r =>
                    r.id === instrumentConfig.id
                );
                if (!entry) {
                    throw new Error("File not in Backend Response");
                }
                this.all[instrumentConfig.id] = entry;
            })
            .catch((err) => {
                console.error(err);
                alert("Could not fetch original yml, see console for details.");
            })
            .finally(() => {
                document.body.classList.remove("waiting");
            });
    },

    extendRanges: function(this: Component<InstrumentData>, id: InstrumentConfigId) {
        for (const param of currentlyVariableParametersFor(this.all[id], this.fixedByUser)) {
            window.extendParamRange(param);
        }
    },

    contractRanges: function(this: Component<InstrumentData>, id: InstrumentConfigId) {
        for (const param of currentlyVariableParametersFor(this.all[id], this.fixedByUser)) {
            window.contractParamRange(param);
        }
    }

}));

Alpine.data("unitParameterList", (unit: BaseUnit, yml: InstrumentConfig) => ({
    collapsed: unit.parameters.every(param => {
        const template = findParamConfig(yml, unit, param).template;
        return template.fixed;
    }),

    reset(param: UnitParameterConfig) {
        param.value = param.originalValue;
        param.range = null;
    },

    centerValue(param: UnitParameterConfig) {
        if (!param.range) {
            return;
        }
        param.value = Math.round(
            0.5 * (param.range[0] + param.range[1])
        );
    }

}));

const findParamConfig = (instrumentConfig: InstrumentConfig, unit: BaseUnit, param: BaseParameter) => {
    const result = instrumentConfig.paramsConfig.find(p =>
        p.unitId === unit.id && p.paramName === param.name
    );
    if (!result) {
        console.error("Did not find Param", param.name, unit.id, "inside", instrumentConfig);
    }
    return result!;
};

// f'ing interfacing for the inline Alpine, es ischd eben NICHD lecker
(window as any).findParamConfig = findParamConfig;
(window as any).isNotFixedByUser = isNotFixedByUser;
(window as any).toggleFixedByUser = toggleFixedByUser;

type InstrumentHeaderData = {
    varyingParams: number,
    totalVariableParams: number,
    generateSamples: number,
    isPosting: boolean,

    startRun: () => void,
}

Alpine.data("instrumentHeader", (instrument: InstrumentConfig, fixedByUser: FixedByUserRecord): WithInit<InstrumentHeaderData> => ({
    varyingParams: 0,
    totalVariableParams: 0,
    generateSamples: 210,
    isPosting: false,

    init(this: Component<InstrumentHeaderData>) {
        this.varyingParams = currentlyVariableParametersFor(instrument, fixedByUser).length;
        this.totalVariableParams = allVariableParametersFor(instrument).length;

        // removed the checkbox for now
        const checkbox = this.$refs.variablesCheckbox as HTMLInputElement;
        if (!checkbox) {
            return;
        }
        checkbox.indeterminate = false;
        if (this.varyingParams === this.totalVariableParams) {
            checkbox.checked = true;
        } else if (this.varyingParams === 0) {
            checkbox.checked = false;
        } else {
            checkbox.indeterminate = true;
        }
    },

    startRun(this: Component<InstrumentHeaderData>) {
        this.isPosting = true;
        window.postJson("/api/sointu/execute-run", { TODO: true })
            .then((res) => {
                alert("RECEIVED: " + JSON.stringify(res));
                this.$router.navigate("/monitor");
            })
            .finally(() => {
                this.isPosting = false;
            })
        ;
    }
}));

export default () => `
    <div
        x-data="instruments"
        class="h-full w-full overflow-auto"
    >
        <div class="text-lg">
            Instrument Definitions
        </div>
        <div x-show="isLoading" class="p-8">
            <loading-icon spin="2s" size="80"></loading-icon>
        </div>
        <div class="flex flex-col gap-2 w-full">
            <template x-for="yml in Object.values(all)" :key="yml.id">
                <div
                    class="my-4"
                    x-data="instrumentHeader(yml, fixedByUser)"
                >
                    <div
                        class="flex gap-4 w-full items-center bg-amber-50 p-2 mb-1 border border-black"
                    >
                        <div class="mr-4">
                            <div class="labeled-input">
                                <label x-text="yml.baseYmlFilename" class="font-bold">
                                </label>
                                <input
                                    type="text"
                                    x-model="yml.name"
                                    :placeholder="yml.name"
                                    class="font-bold"
                                />                            
                            </div>
                        </div>
                        <div class="flex-grow flex items-baseline gap-2">
                            <div class="labeled-input">
                                <label>
                                    MIDI Note (C4 = 60):
                                </label>
                                <input
                                    type="text"
                                    placeholder="number or range 60..128"
                                />
                            </div>
                            <div class="labeled-input">
                                <label>
                                    Sample Seconds:
                                </label>
                                <input
                                    x-model="yml.sampleSeconds"
                                    type="number"
                                    placeholder="2.10"
                                    step="0.1"
                                    min="0.1"
                                    style="width: 6rem"
                                />
                            </div>
                            <div class="labeled-input">
                                <label>
                                    Generate N=...
                                </label>
                                <input
                                    x-model="generateSamples"
                                    type="number"
                                    step="1"
                                    min="1"
                                    style="width: 6rem"
                                />
                                <button
                                    small
                                    class="ml-2 hover:bg-pink-500 hover:text-yellow-300"
                                    @click="startRun"
                                >
                                    <div class="flex items-start gap-2">
                                        <magic-icon></magic-icon>
                                        <span>
                                            Do the Thing!
                                        </span>
                                    </div>                        
                                </button>
                            </div>
                        </div>
                        <div
                            class="flex baseline gap-2 pr-3"
                        >
                            <span
                                x-text="'varying: ' + varyingParams + '/' + totalVariableParams + ' parameters'"
                            ></span>
<!--                            <input-->
<!--                                type="checkbox"-->
<!--                                x-ref="variablesCheckbox"-->
<!--                                @change="-->
<!--                                    toggleAllParametersVariable(yml, event.target.checked);-->
<!--                                    initCheckbox();-->
<!--                                "-->
<!--                            />-->
                        </div>
                        <div class="select-none">
                            <button small
                                @click="extendRanges(yml.id)"
                            >
                                <random-icon></random-icon>
                            </button>         
                            <button small
                                :disabled="!hasRange.includes(yml.id)"
                                @click="contractRanges(yml.id)"
                            >
                                <hammer-icon></hammer-icon>
                            </button>               
                            <button small
                                :disabled="!isChanged.includes(yml.id)"
                                @click="discard(yml)"
                            >
                                <undo-icon></undo-icon>
                            </button>
                            <button small
                                :disabled="!isChanged.includes(yml.id)"
                                @click="submit(yml)"
                            >
                                <save-icon></save-icon>
                            </button>
                        </div>
                    </div>        
                    <div
                        class="flex flex-col overflow-x-auto"
                    >
                        ${instrumentUnits("yml", "init")}
                    </div>
                </div>
            </template>
        </div>
    </div>
`;

const instrumentUnits = (instrVar: string, initFunc: string) => `
    <style>
        td {
            height: 2rem;
        }
        
        tr.param-fixed td:not(:first-of-type) {
            color: #cacaca;
            pointer-events: none;
        }
        
        .param-fixed-by-user {        
            font-weight: bold;
        }
        
        /* the topmost parameter (e.g. "stereo") is actually on the second row */
        tr:nth-of-type(2) td {
            border-top: 1px solid black;
        }
        
        tr:last-of-type td {
            border-bottom: 1px solid black;
        }
        
        td:last-of-type {
            border-right: 1px solid black;
        }
    </style>
    <div
        x-data="{
            maxRows: ${instrVar}.baseInstrument.units.reduce(
                (rows, row) => Math.max(rows, row.parameters.length, 1)
            , 0)
        }"
        class="flex gap-1 select-none pb-1"
    >
        <template x-for="unit in ${instrVar}.baseInstrument.units" :key="unit.id">
            <table
                class="border-collapse"
                x-data="unitParameterList(unit, ${instrVar})"
            >
            <tbody>
                <tr>
                    <td
                        class="text-left border border-black align-top"
                        :rowspan="maxRows + 1"
                    >
                        <div
                            class="p-1 flex flex-col justify-between h-full font-bold cursor-pointer hover:bg-amber-50"
                            @click="collapsed = !collapsed"                            
                        >
                            <div
                                x-text="unit.type"
                                class="flex-grow"
                            ></div>
                            <div
                                x-text="collapsed ? 'Expand' : 'Collapse'"
                                class="text-blue-700 underline text-xs"
                            ></div>
                        </div>
                    </td>
                </tr>
                <template x-for="baseParam in unit.parameters">
                    <tr
                        x-data="{
                            hovered: false,
                            param: findParamConfig(${instrVar}, unit, baseParam),
                        }"
                        @dblclick="console.log(Alpine.raw(param))"
                        class="hover:bg-amber-50"
                        :class="{
                            'param-fixed': param.template.fixed,
                        }"
                        @mouseenter="hovered = true"
                        @mouseleave="hovered = false"
                    >
                        <td></td>   
                        <td
                            class="px-1 text-left cursor-pointer hover:font-bold"
                            x-show="!collapsed"
                        >
                            <span
                                x-text="baseParam.name"
                                x-show="!hovered"
                            ></span>                        
                            <div
                                class="flex"
                                x-show="hovered"
                            >
                                <button
                                    small="very"
                                    @click="reset(param)"
                                    :disabled="
                                        !param.range &&
                                        paramIsOriginal(param)
                                    "
                                >
                                    <undo-icon size="12"></undo-icon>                                
                                </button>
                                <button
                                    small="very"
                                    @click="centerValue(param)"
                                    :disabled="
                                        !param.range ||
                                        param.value - (param.range[0] + param.range[1])/2 === 0
                                    "
                                >
                                    <down-tray-icon size="12"></down-tray-icon>
                                </button>
                                <button
                                    small="very"
                                    @click="contractParamRange(param)"
                                    :disabled="!param.range"
                                >
                                    <hammer-icon size="12"></hammer-icon>
                                </button>
                                <button
                                    small="very"
                                    @click="extendParamRange(param)"
                                >
                                    <random-icon size="12"></random-icon>
                                </button>
                            </div>
                        </td>
                        <td x-show="!collapsed">
                            <parameter-slider
                                :position="param.value"
                                :range="param.range"
                                :min="param.template.min"
                                :max="param.template.max"
                                :disabled="param.template.fixed"
                                @change="param.value = event.detail"
                                @changerange="param.range = event.detail"
                            ></parameter-slider>
                            
                        </td>
                        <td
                            x-show="!collapsed"
                            class="px-1 text-right"
                            x-data="{
                              userFixed: !isNotFixedByUser(fixedByUser[${instrVar}.id])(param)
                            }"
                        >
                            <span
                                x-text="param.value"
                                x-show="!hovered"
                                :class="{
                                    'param-fixed-by-user': userFixed
                                }"
                            ></span>
                            <input
                                type="checkbox"
                                x-show="hovered"
                                :checked="!userFixed"
                                @change="
                                    toggleFixedByUser(param, ${instrVar}, fixedByUser, !userFixed);
                                    ${initFunc}();
                                "
                            />
                        </td>
                    </tr>
                </template>
            ${emptyRows()}
            </tbody>
            </table>
        </template>
    </div>
`;

const emptyRows = () => `
    <template x-for="i in range(maxRows - unit.parameters.length)">
        <tr x-show="!collapsed">
            <td colspan="4">&nbsp;</td>
        </tr>
    </template>
`;
