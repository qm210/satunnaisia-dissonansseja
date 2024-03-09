import WavFilesPage from "./wavFiles.ts";
import CurrentWavPage from "./currentWav.ts";
import UnsavedRatings from "./unsavedRatings.ts";
import LoginPage from "./login.ts";
import MonitorSointuPage from "./sointuMonitor.ts";
import ExecuteSointuPage from "./testExecuteSointu.ts";
import InstrumentsPage from "./instruments.ts";
import MainMenu from "./mainMenu.ts";


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
            <div class="contents">
                ${MainMenu()}
            </div>
        </template>
        <template x-route="/wav">
            <div class="contents relative">
                ${WavFilesPage()}
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
        <template x-route="/instrument-run/:runId">
            <div class="contents">
                ${MonitorSointuPage()}
            </div>
        </template>
        <template x-route="/test-execute">
            <!-- qm @ 2024/03/07 currently unused -->
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
