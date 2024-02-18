import { Rect } from "./types";

export type HasRoot = {
    $root: HTMLElement
};

export const rootPage = (innerHTML: string) => () => ({
    init(this: HasRoot) {
        this.$root.innerHTML = innerHTML;
    }
});

export const yIsInside = (y: number, div: HTMLDivElement) => {
    const rect = div.getBoundingClientRect();
    return y > rect.top && y < rect.bottom;
};

export const getInnerRect = (element: HTMLElement): Rect => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const borderLeft = parseFloat(style.borderLeftWidth);
    const borderRight = parseFloat(style.borderRightWidth);
    const borderTop = parseFloat(style.borderTopWidth);
    const borderBottom = parseFloat(style.borderBottomWidth);
    return {
        left: rect.left + borderLeft,
        right: rect.right - borderRight,
        top: rect.top + borderTop,
        bottom: rect.bottom - borderBottom,
        width: rect.width - borderLeft - borderRight,
        height: rect.height - borderTop - borderBottom
    };
};

export const toKebabCase = (camelCase: string) =>
    camelCase
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
