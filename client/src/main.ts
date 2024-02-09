import "./style.css";
import AsyncAlpine from "async-alpine";
import Alpine from "alpinejs";
import PineconeRouter from "pinecone-router";
import Persist from "@alpinejs/persist";
import { initWindow } from "./initWindow.ts";
import { messageStore, getUserName, initStores } from "./initStores.ts";
import { checkOk } from "./utils/http.ts";
import BackendBroken from "./pages/backendBroken.ts";
import MainPage from "./pages/main";
import LoginPage from "./pages/login";

Alpine.plugin(PineconeRouter);
Alpine.plugin(Persist);
AsyncAlpine.init(Alpine);

initWindow();
initStores();

const root =
    document.querySelector<HTMLDivElement>("#app")!;

const weAreLive = (messages: string[]) => {
    root.innerHTML = getUserName()
        ? MainPage()
        : LoginPage();

    AsyncAlpine.start();
    Alpine.start();

    // this is the most important part, the annoying JOHANN-LAFER-BANNER!!1
    try {
        messageStore().add(messages);
    } catch (err) {
        console.warn(err);
    }
};

checkOk(fetch("/api/info"))
    .then(weAreLive)
    .catch(() => {
        root.innerHTML = BackendBroken();
    });
