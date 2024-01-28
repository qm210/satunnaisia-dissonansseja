export const setupDiv = (id: string, setupMethod: (e: HTMLDivElement) => void) => {
    const element = document.getElementById(id);
    if (!element) {
        console.warn("setupElement found no Element with id", id);
        return;
    }
    setupMethod(element as HTMLDivElement);
};
