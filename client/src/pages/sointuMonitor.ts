import Alpine from "alpinejs";
import { Component, WithInit } from "../types";
import { io, Socket } from "socket.io-client";

type Log = {
    id: number,
    meta: string,
    time: number,
    message: string,
}

type SointuMonitorData = {
    log: Log[],
    runId: number | undefined,
    socket: {
        socket: Socket | null,
        connected: boolean,
    },
    sointu: {
        isRunning: boolean | undefined,
        lastFileWritten: string,
    },

    leave: (path: string) => void,
};

Alpine.data("monitorSointu", (): WithInit<SointuMonitorData> => ({
    log: [],
    runId: undefined,
    sointu: {
        isRunning: undefined,
        lastFileWritten: ""
    },
    socket: {
        socket: null,
        connected: false
    },

    init(this: Component<SointuMonitorData>) {
        this.runId = +this.$router.params.runId;
        if (!this.runId) {
            alert("this route needs a valid numeric /:runId parameter!");
            this.$router.navigate("/");
            return;
        }

        this.socket.socket = io();
        this.socket.socket.on("connect", () => {
            this.socket.connected = true;
        });
        this.socket.socket.on("disconnect", (reason) => {
            if (reason !== "io client disconnect") {
                console.warn("Unexpected Socket Disco...nnect:", reason);
            }
            this.socket.connected = false;
        });
        this.socket.socket.on("message", (data) => {
            console.log("MESSIJJ", data);
        });
        this.socket.socket.on("error", (data) => {
            console.log("WIR IRREN UM ZU STERBEN", data);
        });
    },

    leave(this: Component<SointuMonitorData>, path?: string) {
        // There is no trivial way of a destructor from within the component itself.
        // Until we manage the socket globally, just do it manually.
        if (this.socket.socket) {
            this.socket.socket.close();
            // no idea how to avoid the "Invalid frame header" error after close()
        }
        if (path) {
            this.$router.navigate(path);
        }
    }

}));

export default () => `
    <div
        x-data="monitorSointu"
        class="flex flex-col h-full w-full"
    >
        <button
            @click="leave('/instruments')"
        >
            Back to Instruments
        </button>
        <h2
            x-show="!socket.connected"
            class="m-2 font-bold"
            style="color: darkred"
        >
            SOCKET NOT CONNECTED
        </h2>
        <div
            x-show="socket.connected"
        >
            <h2 class="m-2 font-bold" style="color: green">
                SOCKET CONNECTED
            </h2>
            <h2 class="m-2 font-bold" style="color: darkgrey" x-show="sointu.isRunning === undefined">
                SOINTU STATE UNKNOWN
            </h2>
            <h2 class="m-2 font-bold" style="color: darkblue" x-show="sointu.isRunning === false">
                SOINTU IDLE
            </h2>
            <h2 class="m-2 font-bold" style="color: magenta" x-show="sointu.isRunning === true">
                SOINTU RUNNING
            </h2>
            <div class="p-2 ml-8" x-show="sointu.lastFileWritten" x-text="'Last File Written: ' + sointu.lastFileWritten">
            </div>        
        </div>
        
        <div class="flex-grow flex flex-col w-full items-start p-2 overflow-auto">
            <template x-for="line in log">
                <pre x-text="JSON.stringify(line)"></pre>
            </template>
        </div>
    </div>
`;
