import type Alpine from "alpinejs";
import { PlayIcon } from "./components/icons.ts";
import { Context } from "pinecone-router/dist/types";

export type AppRouter = { [handler: string]: (ctx: Context) => void };

declare global {
    interface Window {
        Alpine: typeof Alpine;
        defaultRouter: AppRouter,
        fetchJson: <T = any>(url: string) => Promise<T | null>;
    }
}

export const initWindow = (alpine: typeof Alpine) => {
    window.Alpine = alpine;

    window.defaultRouter = {
        notFound: (context: Context) => {
            console.log("we match");
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
};

customElements.define("play-icon", PlayIcon);
