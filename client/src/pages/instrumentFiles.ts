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
        window.fetchJson("/api/sointu/instruments")
            .then(res => {
                this.all = res;
                console.log("instruments", res);
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
    >
        <div class="text-lg">
            Instrument YML Definitions
        </div>
        <div class="flex flex-col gap-2 w-full items-center">
            <template x-for="yml in all" :key="yml.file">
                <div class="border border-black">
                    <div
                        x-text="yml.file"
                        class="p-2 border border-b-black bg-amber-50"
                    ></div>
                    <div
                        class="flex flex-col"
                    >
                        <template x-for="unit in yml.instrument.units" :key="unit.id">
                            ${instrumentUnitChild()}
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </div>
`;

const instrumentUnitChild = () => `
    <div
        class="flex flex-row gap-4 items-stretch"
    >
        <div x-text="unit.id"></div>
        <div x-text="unit.type" class="flex-grow align-right"></div>
    </div>
`;
