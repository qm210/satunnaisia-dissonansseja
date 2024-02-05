import { WithMenu } from "../components/withMenu.ts";
import { Rated, ratedProps } from "../enums.ts";
import Alpine from "alpinejs";
import { Rating } from "../types";


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

export default () =>
    WithMenu({
        left: [{
            label: "To Index",
            onClick: "$router.navigate('/')"
        }],
        right: [{
            label: "Back",
            onClick: "history.back()"
        }],
        content: `
            <div
                x-data="{
                    audioPlayer: null,
                    isLoading: true,
                    error: null,
                    
                    rate: (r) => {
                      $store.ratings.setRated($router.params.file, r);
                      history.back()
                    }
                }"
                x-init="
                    fetchIntoAudioPlayer('/api/wav/' + $router.params.file)
                    .then(player => {
                        audioPlayer = player;
                        audioPlayer.play();
                    })
                    .catch((err) => {
                        error = err.message ?? 'Unknown Error';
                        if (err.status === 404) {
                            error = '404 Not Found';
                        }
                    })
                    .finally(() => {
                        isLoading = false;
                    });
                "
                class="text-xl flex flex-col items-center justify-center h-full"
            >
                <div x-text="$router.params.file" class="mt-4"></div>
                <div
                    x-show="error !== null" class="flex-grow flex flex-col justify-center h-full gap-4"
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
