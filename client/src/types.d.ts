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

// can be DB id or (as fallback) baseYmlHash
type InstrumentConfigId = number | string;

export type InstrumentConfig = {
    id: InstrumentConfigId,
    name: string,
    baseYmlFilename: string,
    baseYmlHash: string,
    baseInstrument: BaseInstrument,
    paramsConfig: UnitParameterConfig[],
    noteLower: number,
    noteUpper: number,
    sampleSeconds: number,
    comment?: string,
    updatedAt: number,
    updatedBy: number | string
};

export type BaseInstrument = {
    name: string,
    numvoices: number,
    units: BaseUnit[],
};

export type BaseUnit = {
    type: string,
    id: number,
    parameters: BaseParameter[],
    varargs?: number[]
};

export type UnitParameterConfig = {
    paramName: string,
    value: number,
    range: OptionalRange,
    unitType: string,
    unitId: number,
    template: UnitParameterTemplate
    originalValue: number,
    originalRange: OptionalRange,
}

export type OptionalRange = [number, number] | null;

export type BaseParameter = {
    name: string,
    value: number,
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
