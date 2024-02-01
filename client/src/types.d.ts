import { AlpineComponent } from "alpinejs";
import { Rated } from "./enums.ts";


export type Rating = {
    file: string,
    rated: Rated,
};

export type RatingsStore = AlpineComponent & {
    unsaved: Rating[],
    rate: (file: string, rated: Rated) => void,
    clear: () => void,
};
