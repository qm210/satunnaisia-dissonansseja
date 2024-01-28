import { WithMenu } from "../components/withMenu.ts";

// TODO: how to unify Menu with the one in the files page?
export default () =>
    WithMenu({
        right: [{
            label: "Back",
            onClick: "history.back()"
        }],
        content: `
            <div
                x-data="
                    {audioPlayer: null, isLoading: true}
                "
                x-init="
                    fetchIntoAudioPlayer('/api/wav/' + $router.params.file)
                    .then(player => {
                        isLoading = false;
                        audioPlayer = player;
                        audioPlayer.play();
                    });
                "
                class="text-xl flex flex-col items-center justify-center h-full"
            >
                <div x-text="$router.params.file" class="m-2"></div>
                <div x-show="audioPlayer !== null" class="flex-grow flex flex-col justify-center h-full gap-4">
                    <div class="border border-black p-2">
                        <div>
                            Duration: <span x-text="audioPlayer.duration + ' sec'"></span> 
                        </div>
                        <button
                            @click="audioPlayer.play()"
                            style="align-self: center"
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
                        <div class="flex-1 flex flex-col justify-center p-4 border-r border-black hover:bg-green-200 cursor-pointer">
                            Much Awesome
                        </div>
                        <div class="flex-1 flex flex-col justify-center p-4 border-x border-transparent hover:bg-orange-200 cursor-pointer">
                            Needs Love
                        </div>
                        <div class="flex-1 flex flex-col justify-center p-4 border-l border-black hover:bg-red-200 cursor-pointer">
                            Equals Bubu
                        </div>
                    </div>
                </div>
            </div>
        `
    });