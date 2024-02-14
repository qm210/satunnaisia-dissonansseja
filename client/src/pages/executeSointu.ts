import Alpine from "alpinejs";
import { StatusError } from "../utils/http.ts";
import { WithInit } from "../types";

const initStream = async (url: string, onMessage: (msg: string) => void, onClose: () => void) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new StatusError(response);
    }
    if (!response.body) {
        throw new Error("Response was empty");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const stream = new ReadableStream({
        async start(controller) {
            for (; ;) {
                const { done, value } =
                    await reader.read();
                if (done) {
                    onClose();
                    controller.close();
                    break;
                }
                const decodedValue = decoder.decode(value);
                for (const line of decodedValue.split("\n")) {
                    onMessage(line);
                }
                controller.enqueue(decodedValue);
            }
        }
    });
    // somehow like this we could use the End Result, probably - am not sure about this. Maybe won't need.
    // try {
    //     const result = new Response(stream);
    //     return result.text();
    // } catch {
    //     return undefined;
    // }
};

type ExecutePageData = {
    log: string[],
    done: boolean,
};

Alpine.data("executePage", (): WithInit<ExecutePageData> => ({
    log: [],
    done: false,

    init() {
        this.done = false;
        initStream("/api/sointu/try-execute",
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
        x-data="executePage"
        class="flex flex-col h-full w-full"
    >
        <h2 class="m-2 font-bold" style="color: darkred" x-show="!done">
            Execute Sointu...
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
