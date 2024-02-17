import Alpine from "alpinejs";
import type { Rating, TaggedFile } from "./types";
import { Rated } from "./enums.ts";
import { MessageStore, RatingsStore } from "./stores";
import { Message, milliseconds } from "./utils/types";

// try not to spread the store keys all over the code...
enum StoreKey {
    User = "user",
    Ratings = "ratings",
    Messages = "messages",
    Sointu = "sointu",
}

export const initStores = () => {

    Alpine.store(StoreKey.User, {
        name: Alpine.$persist<string>(
            ""
        ).as("satan.user.name"),

        fetchedWavsLastTime: 0
    });

    Alpine.store(StoreKey.Ratings, {
        unsaved: Alpine.$persist<Rating[]>(
            []
        ).as("satan.ratings.unsaved"),

        playQueue: Alpine.$persist<TaggedFile[]>(
            []
        ).as("satan.ratings.playQueue"),

        alreadyRated(this: RatingsStore, file: string): Rating | null {
            return this.unsaved
                    .find((r: Rating) => r.file === file)
                ?? null;
        },

        setRated(this: RatingsStore, file: string, rated: Rated) {
            const alreadyRated = this.alreadyRated(file);
            if (alreadyRated) {
                alreadyRated.rated = rated;
            } else {
                this.unsaved.push({ file, rated, comment: "" });
            }
        },

        setComment(this: RatingsStore, file: string, comment: string) {
            const alreadyRated = this.alreadyRated(file);
            if (alreadyRated) {
                alreadyRated.comment = comment;
            } else {
                this.unsaved.push({ file, rated: Rated.NotYet, comment });
            }
        },

        clear(this: RatingsStore, file?: string) {
            if (file === undefined) {
                this.unsaved = [];
            } else {
                this.unsaved = this.unsaved
                    .filter((r: Rating) => r.file !== file);
            }
        }

    });

    Alpine.store(StoreKey.Messages, {
        current: [],
        autoId: 0,

        add(this: MessageStore, message: string | string[], lifetime?: milliseconds) {
            let title, subtitle;
            if (message instanceof Array) {
                [title, subtitle] = message;
            } else {
                title = message;
            }
            const id = this.autoId++;
            this.current.push({
                id,
                title,
                subtitle,
                color: !!lifetime ? "darkred" : "#444"
            } as Message);
            if (lifetime) {
                setTimeout(() => {
                    this.current = this.current
                        .filter((n: Message) => n.id !== id);
                }, lifetime);
            }
        }
    });

    Alpine.store(StoreKey.Sointu, {
        unitTemplates: []
    });
};

export const getUserName = () =>
    (Alpine.store(StoreKey.User) as { name: string })?.name;

export const messageStore = () =>
    Alpine.store(StoreKey.Messages) as MessageStore;

// can also access this e.g. via this.$store.ratings.unsaved,
// but maybe you have then to ensure this.store! or... idk man
export const ratingsStore = () =>
    Alpine.store(StoreKey.Ratings) as RatingsStore;
