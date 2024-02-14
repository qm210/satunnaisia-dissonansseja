import WavFilesPage from "./wavFiles.ts";
import CurrentWavPage from "./currentWav.ts";
import UnsavedRatings from "./unsavedRatings.ts";
import LoginPage from "./login.ts";
import ExecuteSointuPage from "./executeSointu.ts";
import InstrumentsPage from "./instrumentFiles.ts";
import { Point } from "../utils/types";


(window as any).contextMenuStyle = (pos: Point) => `
    position: fixed;
    left: ${pos.x ?? 0}px;
    top: ${pos.y}px;
    background-color: #bebebece;
    border-radius: 8px;
    transform: translateY(-100%);
`;

const MessageList = () => `
    <div
        x-data = "{ messages: $store.messages }"
        x-init = "$watch(
            'messages.current', () => $nextTick()
        )"
        class="z-10 fixed flex flex-col-reverse gap-2 bottom-2 right-0"
    >
        <template x-for="message in messages.current" :key="message.id">
            <div
                class="shadow-md text-gray-300 p-1 opacity-60"
                :style="'background-color: ' + message.color"
            >
                <blockquote
                    class="m-1"
                    x-text="message.title"
                >                    
                </blockquote>
                <div
                    class="m-1 text-right text-xs"
                    x-text="message.subtitle"
                    x-show="message.subtitle"
                >
                </div>
            </div>        
        </template>
    </div>
`;

export default () => `
    ${MessageList()}
    <div
        x-data="defaultRouter"
        x-init="
            window.$router = $router;
        "
        class="w-full h-full"        
    >
        <template x-route="/">
            <div class="contents relative">
                ${WavFilesPage()}
                ${NameTag()}
            </div>
        </template>
        <template x-route="/wav/:file*">
            <div class="contents">
                ${CurrentWavPage()}
            </div>
        </template>
        <template x-route="/unsaved">
            <div class="contents">
                ${UnsavedRatings()}
            </div>            
        </template>
        <template x-route="/change-user">
            <div class="contents">
                ${LoginPage()}
            </div>
        </template>
        <template x-route="/execute">
            <div class="contents">
                ${ExecuteSointuPage()}
            </div>        
        </template>
        <template x-route="/instruments">
            <div class="contents">
                ${InstrumentsPage()}            
            </div>
        </template>
        <template x-route="notfound" x-handler="notFound">
        </template>
    </div>
`;


function NameTag() {
    return `
        <div
            class="absolute bottom-6 left-6"
            x-data="{
                showMenu: false,
                menuPos: {x: 0, y: 0},
                toggleMenu: function(event) {
                    event.preventDefault();
                    this.menuPos = clientPos(event);
                    this.$nextTick(() => {
                        this.showMenu = !this.showMenu;
                    });
                },
                deleteAllRatings() {
                    deleteWithParams('/api/rated', {username: $store.user.name})
                    .then((nDeleted) => {
                        alert('Deleted ' + labelledCount(nDeleted, 'rating'));
                        location.reload();
                    });
                }
            }"
            @contextmenu="toggleMenu"
            @contextmenu.window="showMenu = false;"     
            @click.outside="showMenu = false;"       
            @click="showMenu = false;"
            title="Right click for more options"
        >
            <span class="select-none">
                Username:
            </span>
            <a
                href="/change-user"
                x-text="$store.user.name"
            >
            </a>
            <div
                x-show="showMenu"
                class="flex flex-col items-stretch p-1 gap-1"
                :style="contextMenuStyle(menuPos)"
            >
                <button
                    class="flex gap-4"
                    @click="deleteAllRatings()"
                >
                    <trash-icon></trash-icon>
                    <span
                        x-html="'Delete All Ratings For <b>' + $store.user.name + '</b>'"
                    >
                    </span>
                </button>
                <button
                    class="flex gap-4"
                    @click="$router.navigate('/instruments')"
                >
                    <tools-icon></tools-icon>
                    <span>
                        Configure Instruments
                    </span>
                </button>
                <button
                    class="flex gap-4"
                    @click="$router.navigate('/execute')"
                >
                    <audiofile-icon></audiofile-icon>
                    <span>
                        Go to Sointu Execution mode (not quite implemented yet)
                    </span>
                </button>
            </div>
        </div>
    `;
}
