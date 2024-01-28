import type Alpine from "alpinejs";
import { PlayIcon } from "./components/icons.ts";
import { Context } from "pinecone-router/dist/types";

export type AppRouter = { [handler: string]: (ctx: Context) => void };

declare global {
    interface Window {
        Alpine: typeof Alpine;
        defaultRouter: AppRouter,
        fetchJson: <T = any>(url: string) => Promise<T | null>;
        fetchIntoAudioPlayer: (url: string) => Promise<HTMLAudioElement>;
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
        const data = await response.blob();
        const player = getAudioPlayer();
        player.src = URL.createObjectURL(data);

        return new Promise((resolve) => {
            player.addEventListener("loadedmetadata", () => {
                resolve(player);
            });
        });
    };
};

customElements.define("play-icon", PlayIcon);
