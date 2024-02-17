import { clamp } from "../utils/math.ts";
import { getInnerRect, yIsInside } from "../utils/html.ts";
import { Rect } from "../utils/types";

type Handles = {
    slider: HTMLDivElement | undefined,
    current: HTMLDivElement | undefined,
    original: HTMLDivElement | undefined,
    range: HTMLDivElement | undefined,
};

export class ParameterSlider extends HTMLElement {
    private min: number = 0;
    private max: number = 128;
    private value: number = 100;
    private originalValue: number | null;

    private handles: Handles = {} as Handles;
    private _internals: any;

    static observedAttributes = [
        "position"
    ];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this.shadowRoot!.innerHTML = `
            <style>
                #slider {
                    width: 100px;
                    height: 50%;
                    border: 2px solid black;
                    border-radius: 4px;
                    position: relative; 
                }
                .handle {
                    width: 4px;
                    height: 100%;
                    background-color: darkred;
                    position: absolute;
                }
                .original {
                    background-color: silver;                
                }
            </style>
            
            <div id="slider">
                <div id="range"></div>
                <div class="handle original" id="original-value"></div>
                <div class="handle" id="current-value"></div>
            </div>
        `;
        this.initSlider(this.shadowRoot!);

        // // we need this for interaction with Alpine bindings...
        // const observer = new MutationObserver(mutations => {
        //     mutations.forEach(mutation => {
        //         for (const attribute of ParameterSlider.observedAttributes) {
        //             if (mutation.type === "attributes" && mutation.attributeName === attribute) {
        //                 const newValue = this.getAttribute("value");
        //                 // Do something with the new value
        //                 console.log(`value attribute changed to ${newValue}`);
        //             }
        //         }
        //     });
        // });
        // observer.observe(this, { attributes: true });
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        console.log("ACC", name, oldValue, newValue);
        switch (name) {
            case "position":
                this.value = +newValue;
                if (oldValue === null) {
                    this.originalValue = this.value;
                }
                break;
            default:
                return;
        }
        this.updateHandles();
    }

    initSlider(root: ShadowRoot) {
        this.handles.slider =
            root.querySelector<HTMLDivElement>("#slider")!;
        this.handles.current =
            root.querySelector<HTMLDivElement>("#current-value")!;
        this.handles.original =
            root.querySelector<HTMLDivElement>("#original-value")!;
        this.handles.range =
            root.querySelector<HTMLDivElement>("#range")!;

        let isDragging = false;

        this.handles.slider.addEventListener(
            "mousedown", (event) => {
                event.stopPropagation();
                isDragging = true;
                this.moveTo(event);
            });
        document.addEventListener(
            "mouseup", () => {
                isDragging = false;
            });
        this.handles.slider.addEventListener(
            "mousemove", (event) => {
                if (!isDragging) {
                    return;
                }
                event.preventDefault();
                this.moveTo(event);
            });
    }

    moveTo(this: ParameterSlider, event: MouseEvent) {
        const rect = getInnerRect(this.handles.slider!);
        const thickness = this.handles.current!.getBoundingClientRect().width;
        const xRatio = clamp(
            (event.clientX - rect.left) / (rect.width - thickness)
        );
        const newValue = Math.round(
            this.min + xRatio * (this.max - this.min)
        );
        if (newValue !== this.value) {
            this.dispatchEvent(new CustomEvent("change", {
                detail: {
                    value: newValue,
                    previousValue: this.value
                }
            }));
            this.value = newValue;
        }
        this.updateHandles(rect, thickness);
    }

    updateHandles(rect?: Rect, thickness?: number) {
        if (!rect) {
            rect = getInnerRect(this.handles.slider!);
        }
        if (!thickness) {
            thickness = this.handles.current!
                .getBoundingClientRect().width;
        }
        const xPosition = (value: number | null) => {
            if (value === null) {
                return "0";
            }
            const ratio = (value - this.min) / (this.max - this.min);
            return (ratio * (rect!.width - thickness!)) + "px";
        };
        this.handles.current!.style.left = xPosition(this.value);
        this.handles.original!.style.left = xPosition(this.originalValue);
    }

}
