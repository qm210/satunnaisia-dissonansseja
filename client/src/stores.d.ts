import { AlpineComponent } from "alpinejs";
import type { Rating } from "./types";

export type Message = {
    id: number,
    title: string,
    subtitle: string,
    color: string,
};

export type RatingsStore = AlpineComponent<any> & {
    unsaved: Rating[],
};

export type MessageStore = AlpineComponent<any> & {
    current: Message[],
    autoId: number,
};