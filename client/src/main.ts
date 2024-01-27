import Alpine from "alpinejs";
import "./style.css";
import { setupFiles } from "./files.ts";
import { initWindow } from "./initWindow.ts";
import { setupMenu } from "./menu.ts";

initWindow(Alpine);

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
    <div class="z-10 fixed top-2 right-0 bg-gray-800 shadow-md text-gray-300 p-1 opacity-60">
        <blockquote class="m-1">
            "You gonne be my HUBSCHRAUBERLANDEPLATZ?"
        </blockquote>
        <div class="m-1 text-right text-xs">
            - Johann Lafer, ca. 2018, koloriert
        </div>
    </div>
  
    <div class="flex flex-col w-full h-full">
        <div id="menu"></div> 
        <div id="files" class="p-4"></div>
    </div>
`;

const components = [
    {
        id: "menu",
        setup: setupMenu,
    },
    {
        id: "files",
        setup: setupFiles,
    },
];

for (const component of components) {
    const element = document.getElementById(component.id);
    if (!element) {
        console.warn("Element not defined: ", component.id);
        continue;
    }
    if (typeof component.setup === "function") {
        component.setup(element as HTMLDivElement);
    }
}

Alpine.start();
