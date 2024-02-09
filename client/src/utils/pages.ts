import { HasRoot } from "./types";

export const rootPage = (innerHTML: string) => () => ({
    init(this: HasRoot) {
        this.$root.innerHTML = innerHTML;
        console.log("what is", this.$root);
    }
});
