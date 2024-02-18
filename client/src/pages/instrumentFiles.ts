import {
    Component,
    InstrumentFile,
    InstrumentUnit,
    UnitParameter,
    WithInit
} from "../types";
import Alpine from "alpinejs";

type InstrumentData = {
    all: { [file: string]: InstrumentFile },
    isLoading: boolean,
    load: () => void,
    isSubmitting: boolean,
    submit: (file: string) => void,
    discard: (file: string) => void,
    extendRanges: (file: string) => void,
    contractRanges: (file: string) => void,
    isChanged: string[],
    hasRange: string[],
    analyzeDebounce?: number | undefined,
}

const analyzeState = (data: Component<InstrumentData>) => (current: InstrumentFile[]) => {
    if (data.analyzeDebounce) {
        clearTimeout(data.analyzeDebounce);
    }
    data.analyzeDebounce = setTimeout(() => {
        data.analyzeDebounce = undefined;
        data.isChanged = [];
        data.hasRange = [];
        for (const item of Object.values(current)) {
            const allParams = item.instrument.units.flatMap(u => u.parameters);
            const anyRangeDefined = allParams.some(p => p.range);
            if (anyRangeDefined) {
                data.hasRange.push(item.file);
            }
        }
    }, 150);
};

const allVariableParametersFor = (file: InstrumentFile) =>
    file.instrument.units
        .flatMap(u =>
            u.parameters.filter(p =>
                !p.template.fixed
            )
        );

const currentlyVariableParametersFor = (file: InstrumentFile) =>
    allVariableParametersFor(file)
        .filter(p => !p.fixedByUser);

declare global {
    interface Window {
        contractParamRange: (param: UnitParameter) => void,
        extendParamRange: (param: UnitParameter) => void,
        toggleAllParametersVariable: (yml: InstrumentFile, value: boolean) => void,
    }
}

const EXPAND_FACTOR = 0.1;
const CONTRACT_FACTOR = 0.2;

window.contractParamRange = (param: UnitParameter) => {
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

window.extendParamRange = (param: UnitParameter) => {
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

window.toggleAllParametersVariable = (yml: InstrumentFile, value: boolean) => {
    for (const param of allVariableParametersFor(yml)) {
        param.fixedByUser = !value;
    }
};

Alpine.data("instruments", (): WithInit<InstrumentData> => ({
    all: {},
    isChanged: [],
    hasRange: [],
    isLoading: true,
    isSubmitting: false,

    init: function(this: Component<InstrumentData>) {
        this.load();
        this.$watch("all", analyzeState(this));
    },

    load: function(this: Component<InstrumentData>) {
        this.isLoading = true;
        window.fetchJson("/api/sointu/instruments")
            .then((res) => {
                this.all = Object.fromEntries(
                    res.map((r: InstrumentFile) => [r.file, r])
                );
                this.$store.sointu.undoStack = [];
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    submit: function(this: Component<InstrumentData>, filename: string) {
        alert("submit not implömöntid.");
    },

    discard: function(this: Component<InstrumentData>, filename: string) {
        this.load();
    },

    extendRanges: function(this: Component<InstrumentData>, filename: string) {
        for (const param of currentlyVariableParametersFor(this.all[filename])) {
            window.extendParamRange(param);
        }
    },

    contractRanges: function(this: Component<InstrumentData>, filename: string) {
        for (const param of currentlyVariableParametersFor(this.all[filename])) {
            window.contractParamRange(param);
        }
    }

}));

Alpine.data("unitParameterList", (unit: InstrumentUnit) => ({
    collapsed: unit.parameters
        .every(p => p.template.fixed),

    reset(param: UnitParameter) {
        param.value = param.originalValue;
        param.range = null;
    },

    centerValue(param: UnitParameter) {
        if (!param.range) {
            return;
        }
        param.value = Math.round(
            0.5 * (param.range[0] + param.range[1])
        );
    }

}));

// f'ing interfacing for the inline Alpine, es ischd eben NICHD lecker
(window as any).allVariableParametersFor = allVariableParametersFor;
(window as any).currentlyVariableParametersFor = currentlyVariableParametersFor;

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
            <template x-for="yml in all" :key="yml.file">
                <div
                    class="my-4"
                    x-data="{
                        varyingParams: 0,
                        totalVariableParams: 0,
                        
                        initCheckbox() {
                            this.varyingParams = currentlyVariableParametersFor(yml).length;
                            this.totalVariableParams = allVariableParametersFor(yml).length;
                            
                            $refs.variablesCheckbox.indeterminate = false;
                            if (this.varyingParams === this.totalVariableParams) {
                                $refs.variablesCheckbox.checked = true;
                            } else if (this.varyingParams === 0) {
                                $refs.variablesCheckbox.checked = false;
                            } else {
                                $refs.variablesCheckbox.indeterminate = true;
                            }
                        }
                    }"
                    x-init="initCheckbox()"
                >
                    <div
                        class="flex w-full items-center bg-amber-50 p-2 mb-1 border border-black"
                    >
                        <div
                            class="flex-grow"
                            @click="console.log(yml)"
                        >
                            <span
                                x-text="yml.file"
                                class="text-sm"
                            ></span>
                            :&nbsp;
                            <span
                                x-text="yml.instrument.name"
                                class="text-xl"
                            ></span>
                        </div>
                        <div
                            class="flex baseline gap-2 pr-3"
                        >
                            <span
                                x-text="'varying: ' + varyingParams + '/' + totalVariableParams + ' parameters'"
                            ></span>
                            <input
                                type="checkbox"
                                x-ref="variablesCheckbox"
                                @change="
                                    toggleAllParametersVariable(yml, event.target.checked);
                                    initCheckbox();
                                "
                            />
                        </div>
                        <div class="select-none">
                            <button small
                                @click="extendRanges(yml.file)"
                            >
                                <random-icon></random-icon>
                            </button>         
                            <button small
                                :disabled="!hasRange.includes(yml.file)"
                                @click="contractRanges(yml.file)"
                            >
                                <hammer-icon></hammer-icon>
                            </button>               
                            <button small
                                :disabled="!isChanged.includes(yml.file)"
                                @click="discard(yml.file)"
                            >
                                <undo-icon></undo-icon>
                            </button>
                            <button small
                                :disabled="!isChanged.includes(yml.file)"
                                @click="submit(yml.file)"
                            >
                                <save-icon></save-icon>
                            </button>
                        </div>
                    </div>        
                    <div
                        class="flex flex-col overflow-x-auto"
                    >
                        ${instrumentUnits("yml.instrument.units", "initCheckbox")}
                    </div>
                </div>
            </template>
        </div>
    </div>
`;

const instrumentUnits = (list: string, initCheckboxFunc: string) => `
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
            maxRows: ${list}.reduce(
                (rows, row) => Math.max(rows, row.parameters.length, 1)
            , 0)
        }"
        class="flex gap-2 select-none"
    >
        <template x-for="unit in ${list}" :key="unit.id">
            <table
                @contextmenu="console.log(Alpine.raw(${list}))"
                class="border-collapse"
                x-data="unitParameterList(unit)"
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
                <template x-for="param in unit.parameters">
                    <tr
                        x-data="{ hovered: false }"
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
                                x-text="param.name"
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
                                        param.value - param.originalValue === 0
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
                        >
                            <span
                                x-text="param.value"
                                x-show="!hovered"
                                :class="{
                                    'param-fixed-by-user': param.fixedByUser
                                }"
                            ></span>
                            <input
                                type="checkbox"
                                x-show="hovered"
                                :checked="!param.fixedByUser"
                                @change="
                                    param.fixedByUser = !event.target.checked;
                                    ${initCheckboxFunc}();
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
