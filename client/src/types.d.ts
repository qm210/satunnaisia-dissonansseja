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
