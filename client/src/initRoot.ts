import FilesListPage from "./pages/files.ts";
import CurrentWavPage from "./pages/currentWav.ts";
import UnsavedRatings from "./pages/unsavedRatings.ts";

export const initRoot = (backendIsBroken: boolean) => {
    if (backendIsBroken) {
        return `
            <div class="flex flex-col gap-4 h-full justify-center synthglow">
                <ban-icon size="100" color="darkmagenta" class="spinning"></ban-icon>
                <div class="font-bold text-2xl">
                    Backend broken. Fuck the shit off.
                </div>
                <div>
                    Or maybe try (re)starting it and try again, good ma'am.
                </div>
                <div class="text-xs">
                     Sorry for being rude.
                </div>
            </div>
        `;
    }

    return `
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
            <template x-route="/unsaved">
                <div class="contents">
                    ${UnsavedRatings()}
                </div>            
            </template>
            <template x-route="notfound" x-handler="notFound">
            </template>
        </div>
    `;
};
