import { BanIcon, HeartIcon, LameIcon, PlayIcon, PoopIcon, TrashIcon } from "./components/icons.ts";
import { Context } from "pinecone-router/dist/types";

export type AppRouter = { [handler: string]: (ctx: Context) => void };

declare global {
    interface Window {
        $router?: typeof Proxy,
        defaultRouter: AppRouter,
        fetchJson: <T = any>(url: string) => Promise<T | null>;
        fetchIntoAudioPlayer: (url: string) => Promise<HTMLAudioElement>;
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
export const initWindow = () => {

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
};

customElements.define("play-icon", PlayIcon);
customElements.define("heart-icon", HeartIcon);
customElements.define("lame-icon", LameIcon);
customElements.define("poop-icon", PoopIcon);
customElements.define("ban-icon", BanIcon);
customElements.define("trash-icon", TrashIcon);