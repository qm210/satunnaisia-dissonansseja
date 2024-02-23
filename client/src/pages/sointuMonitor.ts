import Alpine from "alpinejs";
import { WithInit } from "../types";

type Log = {
    id: number,
    meta: string,
    time: number,
    message: string,
}

type SointuMonitorData = {
    log: Log[],
    socket: {
        isConnected: boolean,
    },
    sointu: {
        isRunning: boolean,
        lastFileWritten: string,
    }
};

Alpine.data("monitorSointu", (): WithInit<SointuMonitorData> => ({
    log: [],
    socket: {
        isConnected: false
    },
    sointu: {
        isRunning: false,
        lastFileWritten: ""
    },

    init() {

    }

}));

export default () => `
    <div
        x-data="monitorSointu"
        class="flex flex-col h-full w-full"
    >
        <h2 class="m-2 font-bold" style="color: darkred" x-show="!socket.isConnected">
            SOCKET NOT CONNECTED
        </h2>
        <h2 class="m-2 font-bold" style="color: green" x-show="socket.isConnected">
            SOCKET CONNECTED
        </h2>
        <h2 class="m-2 font-bold" style="color: darkblue" x-show="!socket.isRunning">
            SOINTU IDLE
        </h2>
        <h2 class="m-2 font-bold" style="color: magenta" x-show="sointu.isRunning">
            SOINTU RUNNING
        </h2>
        <div class="p-2 ml-8" x-show="sointu.lastFileWritten" x-text="'Last File Written: ' + sointu.lastFileWritten">
        </div>
        <div class="flex-grow flex flex-col w-full items-start p-2 overflow-auto">
            <template x-for="line in log">
                <pre x-text="JSON.stringify(line)"></pre>
            </template>
        </div>
    </div>
`;
