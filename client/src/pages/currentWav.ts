import { WithMenu } from "../components/withMenu.ts";
import { Rated } from "../enums.ts";
import Alpine from "alpinejs";

(window as any).Rated = Rated;

// TODO: how to unify Menu with the one in the files page?
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
                      $store.ratings.rate($router.params.file, r);
                      $router.navigate('/')
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
                    <div>
                        {error}
                    </div>
                </div>
                <div x-show="audioPlayer !== null" class="flex-grow flex flex-col justify-center h-full gap-2">
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
                    <div class="border border-black w-full">
                        <input
                            placeholder="Comment"
                            x-on:focus="$event.target.select()"
                            class="p-2 w-full text-center"
                        />
                    </div>
                    <div class="flex justify-stretch items-stretch border border-black">
                        <div class="flex-1 flex flex-col justify-center p-4 border-r border-black hover:bg-green-200 cursor-pointer whites"
                            @click="rate(Rated.AweSomFul)"
                        >
                            <heart-icon></heart-icon>
                            <span class="whitespace-nowrap">
                                Awesomful
                            </span>
                        </div>
                        <div class="flex-1 flex flex-col justify-center p-4 border-x border-transparent hover:bg-orange-200 cursor-pointer"
                            @click="rate(Rated.NeedsLove)"
                        >
                            <lame-icon></lame-icon>
                            <span class="whitespace-nowrap">
                                Needs Love
                            </span>
                        </div>
                        <div class="flex-1 flex flex-col justify-center p-4 border-l border-black hover:bg-red-200 cursor-pointer"
                            @click="rate(Rated.EqualsBubu)"
                        >
                            <poop-icon></poop-icon>
                            <span class="whitespace-nowrap">
                                Equals Bubu
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `
    });