import "./style.css";
import Alpine from "alpinejs";
import PineconeRouter from "pinecone-router";
import Persist from "@alpinejs/persist";
import { initWindow } from "./initWindow.ts";
import { initStores } from "./initStores.ts";
import { initRoot } from "./initRoot.ts";

Alpine.plugin(PineconeRouter);
Alpine.plugin(Persist);

initWindow();
initStores();

const root = document.querySelector<HTMLDivElement>("#app")!;

fetch("/api/info").then((res) => {
    root.innerHTML = initRoot(res.status !== 200);
    Alpine.start();
});

