export type HasRoot = {
    $root: HTMLElement
};

export const rootPage = (innerHTML: string) => () => ({
    init(this: HasRoot) {
        this.$root.innerHTML = innerHTML;
    }
});
