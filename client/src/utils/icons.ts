import { toKebabCase } from "./html.ts";

type SvgIconProps = {
    children: string,
    viewBox: string
    defaultColor?: string,
    strokeWidth?: string,
    stroke?: string,
};

const getAttributesStringExcept = (names: string[], element: HTMLElement) =>
    element.getAttributeNames()
        .filter(name => !names.includes(name))
        .map(name =>
            ({ name, value: element.getAttribute(name) })
        )
        .map(attr =>
            `${attr.name}="${attr.value}"`
        )
        .join(" ");

const getRestPropsString = (props: { [key: string]: string | undefined }): string => {
    const attributes: string[] = [];
    for (const key in props) {
        if (!props[key]) {
            continue;
        }
        attributes.push(
            `${toKebabCase(key)}="${props[key]}"`
        );
    }
    return attributes.join(" ");
};

const createSpinPart = (element: HTMLElement) => {
    const spin = element.getAttribute("spin");
    if (!spin) {
        return {
            style: "",
            class: ""
        };
    }
    return {
        style: `
            <style>
                .spinning {
                    animation: spin ${spin} linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
        `,
        class: "class=\"spinning\""
    };
};

export const addSvgPathAsShadow = (element: HTMLElement, {
    children,
    viewBox,
    defaultColor,
    ...props
}: SvgIconProps) => {
    const shadow = element.attachShadow({ mode: "open" });
    const size = element.getAttribute("size") || 24;
    const color = element.getAttribute("color") || defaultColor || "currentColor";
    const spin = createSpinPart(element);
    const otherProps = getRestPropsString(props);
    const otherAttributes = getAttributesStringExcept(["size, color, spin"], element);
    viewBox ||= `0 0 ${size} ${size}`;
    children ||= "<slot></slot>";
    shadow.innerHTML = `
            ${spin.style}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="${size}"
                height="${size}"
                viewBox="${viewBox}"
                fill="${color}"
                ${otherAttributes}
                ${spin.class}
                ${otherProps}
            >
                ${children}
            </svg>
        `;
};
