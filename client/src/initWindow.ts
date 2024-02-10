import {
    BanIcon,
    CrossIcon,
    HeartIcon,
    LameIcon, LoadingIcon,
    PlayIcon,
    PoopIcon,
    SaveIcon,
    TrashIcon
} from "./components/icons.ts";
import { Context } from "pinecone-router/dist/types";
import { Point } from "./utils/types";
import Alpine from "alpinejs";

export type AppRouter = { [handler: string]: (ctx: Context) => void };

declare global {
    interface Window {
        // setup
        Alpine: typeof Alpine, // this is just useful for Console debugging
        $router?: typeof Proxy,
        defaultRouter: AppRouter,

        // general helpers
        fetchJson: <R = any>(url: string) => Promise<R | null>;
        fetchIntoAudioPlayer: (url: string) => Promise<HTMLAudioElement>;
        postJson: <T extends object | void = void, R = void>(url: string, body: T) => Promise<R | undefined>;
        deleteWithParams: (url: string, params: Record<string, string>) => Promise<any>;
        setDebounced: (callback: () => void) => void;
        clientPos: (event: MouseEvent) => Point;
    }
}

class StatusError extends Error {
    public status: number | undefined;

    constructor({ statusText, status }: { statusText?: string, status?: number }) {
        super(statusText);
        this.status = status;
    }
}

// this extends the window object with somewhat that is our own global library.
// we need this to call functions like fetchJson() from the x-init parts
export const initWindow = (alpine: typeof Alpine) => {

    window.Alpine = alpine;

    window.defaultRouter = {
        notFound: (context: Context) => {
            context.redirect("/");
        }
    };

    window.fetchJson = async (url: string) => {
        try {
            const response = await fetch(url);
            return response.json();
        } catch (err) {
            console.warn("fetchJson ERROR", url, err);
            return null;
        }
    };

    const content = async <R = unknown>(response: Response): Promise<R> => {
        let result: R | string | undefined;
        if (response.headers.get("Content-Type")?.includes("application/json")) {
            result = await response.json();
        } else {
            result = await response.text();
        }
        return result as R;
    };

    window.postJson = async <T, R>(url: string, body: T) => {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: body ? JSON.stringify(body) : undefined,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            });
            return content<R>(response);
        } catch (err) {
            console.warn("postJson ERROR", url, body, err);
        }
    };

    window.deleteWithParams = async <T extends Record<string, string>, R = void>(url: string, params: T) => {
        const query = (new URLSearchParams(params)).toString();
        const fullUrl = `${url}?${query}`;
        try {
            const response = await fetch(fullUrl, {
                method: "DELETE"
            });
            return content<R>(response);
        } catch (err) {
            console.warn("deleteWithParams ERROR", fullUrl, params);
        }
    };

    const getAudioPlayer = (): HTMLAudioElement => {
        const player = document.querySelector<HTMLAudioElement>("#audioPlayer");
        if (player) {
            return player;
        }
        const element = document.createElement("audio");
        element.id = "audioPlayer";
        element.style.visibility = "hidden";
        document.body.appendChild(element);
        return element;
    };

    window.fetchIntoAudioPlayer = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new StatusError(response);
        }
        const data = await response.blob();
        const player = getAudioPlayer();
        const loadReader = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = resolve;
            reader.onerror = reject;
            reader.readAsDataURL(data);
        });
        const loadMetaData = new Promise((resolve, reject) => {
            player.src = URL.createObjectURL(data);
            player.addEventListener("loadedmetadata", resolve);
            player.addEventListener("error", () =>
                reject("LoadMetaData failed.")
            );
        });
        await Promise.all([loadReader, loadMetaData]);
        return player;
    };

    // works only for one debounce at a time, obviously, but this should be enough for now.
    let timeout: number | undefined;
    window.setDebounced = (callback: (() => void)) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback();
            timeout = undefined;
        }, 250);
    };

    window.clientPos = (event: MouseEvent): Point => {
        return {
            x: event.clientX,
            y: event.clientY
        };
    };
};

customElements.define("play-icon", PlayIcon);
customElements.define("heart-icon", HeartIcon);
customElements.define("lame-icon", LameIcon);
customElements.define("poop-icon", PoopIcon);
customElements.define("ban-icon", BanIcon);
customElements.define("trash-icon", TrashIcon);
customElements.define("x-mark", CrossIcon);
customElements.define("save-icon", SaveIcon);
customElements.define("loading-icon", LoadingIcon);
