import {
    AudioFileIcon,
    BanIcon,
    CrossIcon,
    HeartIcon,
    LameIcon, LeaveIcon,
    LoadingIcon,
    PlayIcon,
    PoopIcon,
    SaveIcon,
    ToolsIcon,
    TrashIcon
} from "./components/icons.ts";
import { Context } from "pinecone-router/dist/types";
import { Point } from "./utils/types";
import Alpine from "alpinejs";
import { fetchContent, fetchResponse } from "./utils/http.ts";
import { ParameterSlider } from "./components/parameterSlider.ts";

export type AppRouter = { [handler: string]: (ctx: Context) => void };

declare global {
    interface Window {
        // setup
        Alpine: typeof Alpine,
        $router?: typeof Proxy,
        defaultRouter: AppRouter,

        // general helpers
        fetchJson: <R = any>(url: string | string[]) => Promise<R | null>;
        fetchIntoAudioPlayer: (url: string) => Promise<HTMLAudioElement>;
        postJson: <T extends object | void = void, R = void>(url: string, body?: T) => Promise<R | undefined>;
        deleteWithParams: (url: string, params: Record<string, string>) => Promise<any>;
        setDebounced: (callback: () => void) => void;
        clientPos: (event: MouseEvent) => Point;
        range: (n: number) => number[],
    }
}

// this extends the window object with somewhat that is our own global library.
// we need this to call functions like fetchJson() from the x-init parts
export const initWindow = (alpine: typeof Alpine) => {

    initCustomElements();

    // this is basically just useful for Console debugging, not required.
    window.Alpine = alpine;

    window.defaultRouter = {
        notFound: (context: Context) => {
            console.log("Route not defined: ", context.path);
            context.redirect("/");
        }
    };

    window.fetchJson = async <R>(url: string | string[]) => {
        try {
            if (url instanceof Array) {
                return Promise.all(
                    url.map(it => fetchContent(it))
                ) as Promise<R>;
            } else {
                return fetchContent(url) as Promise<R>;
            }
        } catch (err) {
            console.warn("fetchJson ERROR", url, err);
            return null;
        }
    };

    window.postJson = async <T, R>(url: string, body?: T) =>
        fetchContent(url, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }) as Promise<R>;

    window.deleteWithParams = async <T extends Record<string, string>, R = void>(url: string, params: T) => {
        const query = (new URLSearchParams(params)).toString();
        const fullUrl = `${url}?${query}`;
        try {
            return (
                fetchContent(fullUrl, {
                    method: "DELETE"
                })
            ) as Promise<R>;
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
        const response = await fetchResponse(url);
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

    window.range = (n: number) =>
        Array(n).fill(0)
            .map((_, i) => i);
};

const initCustomElements = () => {
    customElements.define("parameter-slider", ParameterSlider);

    customElements.define("play-icon", PlayIcon);
    customElements.define("heart-icon", HeartIcon);
    customElements.define("lame-icon", LameIcon);
    customElements.define("poop-icon", PoopIcon);
    customElements.define("ban-icon", BanIcon);
    customElements.define("trash-icon", TrashIcon);
    customElements.define("x-mark", CrossIcon);
    customElements.define("save-icon", SaveIcon);
    customElements.define("loading-icon", LoadingIcon);
    customElements.define("audiofile-icon", AudioFileIcon);
    customElements.define("tools-icon", ToolsIcon);
    customElements.define("leave-icon", LeaveIcon);
};
