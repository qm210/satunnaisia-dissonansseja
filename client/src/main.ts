import "./style.css";
import Alpine from "alpinejs";
import PineconeRouter from "pinecone-router";
import Persist from "@alpinejs/persist";
import { initWindow } from "./initWindow.ts";
import FilesListPage from "./pages/files";
import CurrentWavPage from "./pages/currentWav";
import { Rated } from "./enums.ts";
import type { RatingsStore, Rating } from "./types";

Alpine.plugin(PineconeRouter);
Alpine.plugin(Persist);

initWindow();

const root = document.querySelector<HTMLDivElement>("#app")!;

fetch("/api/info").then((res) => {
    if (res.status !== 200) {
        root.innerHTML = `
            <div class="font-bold">
                Backend broken. Fuck the shit off.
            </div>
            <div>
                Or maybe try (re)starting it and try again, good ma'am.
            </div>
            <div class="text-sm">
                 Sorry for being rude.
            </div>
        `;
    }
});

root.innerHTML = `
    <!-- this is the most important part, the annoying Johann-Lafer-Banner -->
    <div class="z-10 fixed bottom-2 right-0 bg-gray-800 shadow-md text-gray-300 p-1 opacity-60">
        <blockquote class="m-1">
            "You gonne be my HUBSCHRAUBERLANDEPLATZ?"
        </blockquote>
        <div class="m-1 text-right text-xs">
            - Johann Lafer, ca. 2018, koloriert
        </div>
    </div>
 
    <div
        x-data="defaultRouter"
        x-init="
            window.$router = $router;
        "
        class="w-full h-full"
    >
        <template x-route="/">
            <div class="contents">
                ${FilesListPage()}
            </div>
        </template>
        <template x-route="/wav/:file*">
            <div class="contents">
                ${CurrentWavPage()}
            </div>
        </template>
        <template x-route="notfound" x-handler="notFound">
        </template>
    </div>
`;

document.addEventListener("alpine:init", () => {
    Alpine.store("ratings", {
        unsaved: Alpine.$persist<Rating[]>(
            []
        ).as("satan.ratings.unsaved"),

        rate(this: RatingsStore, file: string, rated: Rated) {
            const alreadyRated = this.unsaved
                .find((r: Rating) => r.file === file);
            if (alreadyRated) {
                alreadyRated.rated = rated;
            } else {
                this.unsaved
                    .push({ file, rated });
            }
        },

        clear(this: RatingsStore) {
            this.unsaved = [];
        }
    });
});

Alpine.start();
