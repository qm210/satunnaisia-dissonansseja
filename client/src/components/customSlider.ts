import { clamp } from "../utils/math.ts";
import { getInnerRect, yIsInside } from "../utils/html.ts";
import { Rect } from "../utils/types";

type Handles = {
    slider: HTMLDivElement | undefined,
    current: HTMLDivElement | undefined,
    original: HTMLDivElement | undefined,
    range: HTMLDivElement | undefined,
};

export class CustomSlider extends HTMLElement {
    private min: number = 0;
    private max: number = 128;
    private value: number = 100;
    private originalValue: number | null = 30;

    private handles: Handles = {} as Handles;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
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
            });
        // this.handles.slider.addEventListener(
        //     "mouseleave", (event) => {
        //         if (isDragging &&
        //             yIsInside(event.clientY, this.handles.slider!)) {
        //             this.moveTo(event);
        //         }
        //         isDragging = false;
        //     });
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

    moveTo(this: CustomSlider, event: MouseEvent) {
        const rect = getInnerRect(this.handles.slider!);
        const thickness = this.handles.current!.getBoundingClientRect().width;
        const xRatio = clamp(
            (event.clientX - rect.left) / (rect.width - thickness)
        );
        this.value = this.min + xRatio * (this.max - this.min);
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
        const rCurrent = (this.value - this.min) / (this.max - this.min);
        const xCurrent = rCurrent * (rect.width - thickness);
        this.handles.current!.style.left = `${xCurrent}px`;
    }

}
