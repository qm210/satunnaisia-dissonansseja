import FilesListPage from "./files.ts";
import CurrentWavPage from "./currentWav.ts";
import UnsavedRatings from "./unsavedRatings.ts";
import LoginPage from "./login";
import { messageStore } from "../initStores.ts";
import Alpine from "alpinejs";


(window as any).debug = () => {
    console.log("Message Store", Alpine.raw(messageStore()));
};

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
                ${FilesListPage()}
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
        <template x-route="notfound" x-handler="notFound">
        </template>
    </div>
`;


function NameTag() {
    return `
        <div class="absolute bottom-6 left-6">
            <span @dblclick="debug()" class="select-none">
                Username:
            </span>
            <a
                href="/change-user"
                x-text="$store.user.name"
            />
        </div>
    `;
}