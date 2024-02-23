import Alpine from "alpinejs";
import { WithInit } from "../types";
import { readStream } from "../utils/http.ts";

type TestExecutePageData = {
    log: string[],
    done: boolean,
};

Alpine.data("testExecutePage", (): WithInit<TestExecutePageData> => ({
    log: [],
    done: false,

    init() {
        this.done = false;
        readStream("/api/sointu/test-execute",
            (message) => {
                this.log.push(message);
            },
            () => {
                this.done = true;
                console.log("Log", this.log);
            }
        ).catch(alert);
    }

}));

export default () => `
    <div
        x-data="testExecutePage"
        class="flex flex-col h-full w-full"
    >
        <h2 class="m-2 font-bold" style="color: darkred" x-show="!done">
            Execute Sointu test.wav...
        </h2>
        <h2 class="m-2 font-bold" style="color: green" x-show="done">
            Execution finished.
        </h2>
        <div class="flex-grow flex flex-col w-full items-start p-2 overflow-auto">
            <template x-for="line in log">
                <pre x-text="line"></pre>
            </template>
        </div>
    </div>
`;
