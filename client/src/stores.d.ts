import { AlpineComponent } from "alpinejs";
import type { Rating, TaggedFile } from "./types";
import { Message } from "./utils/types";
import { Rated } from "./enums.ts";

export type Store = {
    ratings: RatingsStore,
    messages: MessageStore,
    user: {
        name: string,
        fetchedWavsLastTime: number | null,
    }
};

export type RatingsStore = AlpineComponent<{
    unsaved: Rating[],
    playQueue: TaggedFile[],
    alreadyRated: (file: string) => Rating | null,
    setRated: (file: string, rated: Rated) => void,
    setComment: (file: string, comment: string) => void,
    clear: () => void,
}>;

export type MessageStore = AlpineComponent<{
    current: Message[],
    autoId: number,
    add: (message: string | string[], lifetime?: number) => void,
}>;
