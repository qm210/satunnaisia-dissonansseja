import type Alpine from "alpinejs";
import { PlayIcon } from "./components/icons.ts";

declare global {
    interface Window {
        Alpine: typeof Alpine;
        fetchJson: <T = any>(url: string) => Promise<T | null>;
    }
}

export const initWindow = (alpine: typeof Alpine) => {
    window.Alpine = alpine;

    window.fetchJson = async (url: string) => {
        try {
            const response = await fetch(url);
            return response.json();
        } catch (err) {
            console.warn("error on fetch", url, err);
            return null;
        }
    };
};

// document.addEventListener("alpine:init", () => {
//   console.log("hello cool bois");
// });

customElements.define("play-icon", PlayIcon);
