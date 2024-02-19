import { Rated } from "./enums.ts";
import { AlpineComponent } from "alpinejs";
import { Store } from "./stores";

export type WithInit<T> = T & {
    init: (this: Component<T>) => void,
};

export type Component<T> = AlpineComponent<T & {
    $store: Store,
    $watch: <T>(variable: string, callback: (update: T) => void) => void,
    $router: {
        navigate(path: string): void,
        params: Record<string, string>,
        currentRoute: string,
    }
}>;

export type Rating = {
    file: string,
    rated: Rated,
    comment: string,
};

export type TaggedFile = {
    name: string,
    path: string,
    tag: string
};

export type TaggedFileGroup = {
    files: TaggedFile[],
    tag: string
};

export type BaseInstrumentFile = {
    file: string,
    error: any,
    instrument: BaseInstrument,
    params: InstrumentParamConfig[],
};

export type BaseInstrument = {
    name: string,
    numvoices: number,
    units: InstrumentUnit[],
};

export type InstrumentUnit = {
    type: string,
    id: number,
    parameters: UnitParameter[],
    varargs?: number[]
};

export type InstrumentParamConfig = {
    paramName: string,
    value: number,
    range: OptionalRange,
    unitType: string,
    unitId: number,
    template: UnitParameterTemplate
    originalValue: number,
    fixedByUser?: boolean, // frontend field to toggle for the global randomization operations (extend range etc.)
}

export type OptionalRange = [number, number] | null;

export type UnitParameter = {
    name: string,
    value: number,
    range?: OptionalRange,
};

export type UnitParameterTemplate = {
    name: string,
    value: number
    min: number,
    max: number,
    fixed?: boolean,
    optional?: boolean,
    special?: boolean
    // TODO: need to think of something for the varArgs...
};

export type UnitTemplate = {
    name: string,
    allParams: string[],
    paramTemplates: any[],
    varArgs: any,
};

export type UnitParamState = {
    instrumentYml: string,
    paramName: string,
    previousValue: number,
    currentValue: number,
    timestamp: number,
};
