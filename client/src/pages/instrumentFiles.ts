import { Component, TaggedFile, WithInit } from "../types";
import Alpine from "alpinejs";

type InstrumentData = {
    all: TaggedFile[],
    isLoading: boolean,
    load: () => void,
    isSubmitting: boolean,
    submit: () => void,
    discard: () => void,
}

Alpine.data("instruments", (): WithInit<InstrumentData> => ({
    all: [],
    isLoading: true,
    isSubmitting: false,

    init: function(this: Component<InstrumentData>) {
        this.load();
    },

    load: function(this: Component<InstrumentData>) {
        this.isLoading = true;
        window.fetchJson([
            "/api/sointu/instruments",
            "/api/sointu/unit-templates"
        ])
            .then((res) => {
                this.all = res[0];
                // TODO: maybe this.$store.sointu.unitTemplates is not needed ever.
                this.$store.sointu.unitTemplates = res[1];
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    submit: function(this: Component<InstrumentData>) {
        alert("submit not implömöntid.");
    },

    discard: function(this: Component<InstrumentData>) {
        alert("discard not impëlëmentëd.");
    }

}));

export default () => `
    <div
        x-data="instruments"
        class="h-full w-full overflow-auto"
    >
        <div class="text-lg">
            Instrument YML Definitions
        </div>
        <div x-show="isLoading" class="p-8">
            <loading-icon spin="2s" size="80"></loading-icon>
        </div>
        <div class="flex flex-col gap-2 w-full">
            <template x-for="yml in all" :key="yml.file">
                <div class="my-4">
                    <div
                        x-text="yml.file"
                        class="p-2 mb-1 border border-black bg-amber-50"
                        @click="console.log(yml)"
                    ></div>
                    <div
                        class="flex flex-col"
                    >
                        ${instrumentUnits("yml.instrument.units")}
                    </div>
                </div>
            </template>
        </div>
    </div>
`;

(window as any).isFixed = (param: any) =>
    !param.template;

const instrumentUnits = (list: string) => `
    <style>
        td {
            --border: 1px solid black;
            height: 2rem;
        }
        
        tr.param-fixed td:not(:first-of-type) {
            color: #cacaca;
        }
        
        tr:first-of-type td {
            border-top: var(--border);
        }
        
        tr:last-of-type td {
            border-bottom: var(--border);
        }
        
        td:last-of-type {
            border-right: var(--border);
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
                x-data="{
                    collapsed: unit.parameters.every(isFixed),
                }"
            >
            <tbody>
            <template x-for="(param, index) in unit.parameters">
                    <tr
                        @dblclick="console.log(Alpine.raw(param))"
                        :class="{
                            'param-fixed': isFixed(param)
                        }"
                    >
                        <td
                            class="text-left border border-black align-top"
                            :rowspan="maxRows"
                            :style="{
                                display: index === 0 ? 'table-cell' : 'none'
                            }"
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
                        <td
                            x-text="param.name"
                            x-show="!collapsed"
                            class="px-1 text-left"
                        ></td>
                        <td x-show="!collapsed">
                            <parameter-slider
                                :position="param.value"
                                :min="param.template?.min"
                                :max="param.template?.max"
                                :disabled="isFixed(param)"
                                @change="param.value = event.detail.value"
                            ></parameter-slider>
                        </td>
                        <td
                            x-text="param.value"
                            x-show="!collapsed"
                            class="px-1 text-right"
                        ></td>
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
