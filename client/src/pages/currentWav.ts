import { Menu } from "../components/menu.ts";

// TODO: how to unify Menu with the one in the files page?
export default () =>
    Menu({
        right: [{
            label: "Back",
            onClick: "history.back()"
        }]
    }) + `
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
        class="text-xl flex flex-col"
    >
        <div x-text="$router.params.file" class="m-2"></div>
        <div x-show="audioPlayer !== null">
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
    </div>
`;
