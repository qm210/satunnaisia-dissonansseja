import { WithMenu } from "../components/withMenu.ts";
import { Rated, ratedProps } from "../enums.ts";
import Alpine from "alpinejs";
import { Component, Rating, TaggedFile, WithInit } from "../types";
import { ratingsStore } from "../initStores.ts";
import { RatingsStore } from "../stores";


(window as any).Rated = Rated;
(window as any).ratedProps = ratedProps;

Alpine.data("initCurrentWav", (alreadyRated: Rating | null) => ({
    alreadyRated,
    inputComment: alreadyRated?.comment ?? "",
    extraClassesFor: (rated: Rated) =>
        Object.fromEntries(
            Object.entries(ratedProps)
                .flatMap(e => [
                    [e[1].extraClass, e[0] === rated],
                    ["text-yellow", e[0] === alreadyRated?.rated]
                ])
        )
}));

type CurrentWavData = {
    audioPlayer: HTMLAudioElement | null,
    isLoading: boolean,
    error: any,
    nextFile: string,
    rate: (r: Rated) => void,
};

const discardPreviousElements = (queue: TaggedFile[], current: string) => {
    const currentIndex = queue.findIndex(file =>
        file.path === current
    );
    queue.splice(0, currentIndex);
};

const initNextFile = (data: Component<CurrentWavData>, currentPath: string) => {
    const queue = data.$store.ratings.playQueue;
    discardPreviousElements(queue, currentPath);
    data.nextFile = queue[1]?.path ?? "";
};

Alpine.data("currentWav", (): WithInit<CurrentWavData> => ({
    audioPlayer: null,
    isLoading: true,
    error: null,
    nextFile: "",

    init: function(this: Component<CurrentWavData>) {
        const file = this.$router.params.file;
        initNextFile(this, file);
        window.fetchIntoAudioPlayer("/api/wav/" + file)
            .then(player => {
                this.audioPlayer = player;
                this.audioPlayer.play();
            })
            .catch((err) => {
                this.error = err.message ?? "Unknown Error";
                if (err.status === 404) {
                    this.error = "404 Not Found";
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
        this.$watch("$router.currentRoute", () => {
            this.init!();
        });
    },

    rate: function(this: Component<CurrentWavData>, r: Rated) {
        ratingsStore().setRated(this.$router.params.file, r);
        if (ratingsStore().playQueue.length === 0) {
            history.back();
        } else if (!this.nextFile) {
            this.$router.navigate("/");
        } else {
            ratingsStore().playQueue.shift();
            this.$router.navigate("/wav/" + this.nextFile);
            this.nextFile = this.$store.ratings.playQueue[1]?.path ?? "";
        }
    }
}));

export default () =>
    WithMenu({
        left: [{
            label: "To Index",
            onClick: "$router.navigate('/');"
        }],
        right: [{
            label: "Back",
            onClick: "history.back()"
        }],
        content: `
            <div
                x-data="currentWav"
                class="text-xl flex flex-col items-center justify-center h-full"
            >
                <div x-text="$router.params.file" class="mt-4"></div>
                <div
                    x-show="nextFile"
                    class="text-xs mt-1"
                >
                    <span>
                        Playing next:
                    </span>
                    <a
                        x-bind:href="'/wav/' + nextFile"
                        x-text="nextFile"
                    >
                    </a>
                </div>
                <div
                    x-show="error !== null" 
                    class="flex-grow flex flex-col justify-center h-full gap-4"
                    @click="$router.navigate('/')"
                >
                    <ban-icon size="6rem" color="red"></ban-icon>
                    <div x-text="error">
                    </div>
                </div>
                <div
                    x-show="audioPlayer !== null"
                    class="flex-grow flex flex-col justify-center h-full gap-2"
                    x-data="initCurrentWav($store.ratings.alreadyRated($router.params.file))"
                >
                    <div class="border border-black">
                        <div class="text-xs m-1">
                            Duration: <span x-text="audioPlayer?.duration + ' sec'"></span> 
                        </div>
                        <button
                            @click="audioPlayer.play()"
                            style="align-self: center"
                            class="m-2"
                        >
                            <div class="flex flex-nowrap items-center gap-4" style="align-items: center">
                                <play-icon></play-icon>
                                <span>Replay</span>
                            </div>
                        </button>
                    </div>
                    <div
                        class="flex items-center border border-black w-full"
                    >
                        <input
                            type="text"
                            x-model="inputComment"
                            placeholder="Comment..."
                            x-on:input="setDebounced(() => $store.ratings.setComment($router.params.file, inputComment));"
                            x-on:focus="$event.target.select()"
                            class="p-2 w-full text-center"
                        />
                        <span
                            class="p-2 cursor-pointer"
                            x-show="!!inputComment"
                            x-on:click="
                                $store.ratings.setComment($router.params.file, '');
                                inputComment = '';
                            "
                        >
                            <x-mark></x-mark>
                        </span>
                    </div>
                    <div
                        class="flex justify-stretch items-stretch divide-x divide-black border-r border-y border-black"
                    >
                        <template x-for="rated of [Rated.Awesomful, Rated.NeedsLove, Rated.EqualsBubu]">
                            <div
                                class="flex-1 flex flex-col justify-center p-4 cursor-pointer whites"
                                @click="rate(rated)"
                                :class="extraClassesFor(rated)"
                            >
                                <div x-html="ratedProps[rated].html"></div>
                                <span
                                    class="whitespace-nowrap"
                                    x-text="ratedProps[rated].title"
                                >    
                                </span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        `
    });
