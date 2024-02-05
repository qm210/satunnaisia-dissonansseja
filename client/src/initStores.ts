import Alpine, { AlpineComponent } from "alpinejs";
import type { Rating } from "./types";
import { Rated } from "./enums.ts";

export type RatingsStore = AlpineComponent<any> & {
    unsaved: Rating[],
};

export const initStores = () => {

    Alpine.store("ratings", {
        unsaved: Alpine.$persist<Rating[]>(
            []
        ).as("satan.ratings.unsaved"),

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
};
