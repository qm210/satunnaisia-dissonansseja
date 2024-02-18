import { clamp } from "../utils/math.ts";
import { getInnerRect } from "../utils/html.ts";
import { Rect } from "../utils/types";

type Handles = {
    slider: HTMLDivElement | undefined,
    current: HTMLDivElement | undefined,
    original: HTMLDivElement | undefined,
    range: HTMLDivElement | undefined,
};

type MoveOptions = {
    extendRange?: boolean,
};

export class ParameterSlider extends HTMLElement {
    private min: number = 0;
    private max: number = 128;
    private value: number = 64;
    private originalValue: number | null = null;
    private range: [number, number] | null = null;
    private disabled: boolean = false;

    private handles: Handles = {} as Handles;

    static observedAttributes = [
        "position",
        "range",
        "min",
        "max",
        "disabled"
    ];

    static ChangePosition = "change";
    static ChangeRange = "changerange";

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
                                
                #slider.disabled {
                    background-color: #0001;
                }
                                
                .handle {
                    width: 4px;
                    height: 100%;
                    background-color: darkred;
                    position: absolute;
                }
                
                #slider.disabled .handle {
                    background-color: #666;
                }
                
                .original {
                    background-color: black;
                    opacity: 0.2;
                }
                
                #range {
                    height: 100%;
                    background-color: darkorange;
                    opacity: 0.5;
                    position: absolute;
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

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        switch (name) {
            case "position":
                this.value = +newValue;
                if (oldValue === null) {
                    this.originalValue = this.value;
                }
                break;
            case "min":
                this.min = +newValue;
                break;
            case "max":
                this.max = +newValue;
                break;
            case "disabled":
                this.disabled = !!newValue;
                break;
            case "range":
                try {
                    const parsed = newValue.split(",");
                    this.range = [+parsed[0], +parsed[1]];
                } catch {
                    this.range = null;
                }
                break;
            default:
                console.log("Unhandled Attribute Change", name, newValue, oldValue);
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
                if (this.disabled) {
                    return;
                }
                event.stopPropagation();
                isDragging = true;
                this.moveTo(event, { extendRange: false });
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
                this.moveTo(event, { extendRange: true });
            });
    }

    dispatchChange(this: ParameterSlider, type: string, detail: any) {
        this.dispatchEvent(
            new CustomEvent(
                type,
                { detail }
            ));
    }

    moveTo(this: ParameterSlider, event: MouseEvent, options?: MoveOptions) {
        const rect = getInnerRect(this.handles.slider!);
        const thickness = this.handles.current!.getBoundingClientRect().width;
        const xRatio = clamp(
            (event.clientX - rect.left) / (rect.width - thickness)
        );
        const newValue = Math.round(
            this.min + xRatio * (this.max - this.min)
        );

        if (newValue !== this.value) {
            this.dispatchChange(
                ParameterSlider.ChangePosition,
                newValue
            );
            this.value = newValue;
        }

        const oldRangeLower = this.range?.[0];
        const oldRangeUpper = this.range?.[1];

        if (options?.extendRange) {
            this.range = !this.range
                ? [this.value, this.value]
                : [
                    Math.min(this.range[0], this.value),
                    Math.max(this.range[1], this.value)
                ];
        } else {
            this.range = null;
        }
        if (this.range?.[0] !== oldRangeLower ||
            this.range?.[1] !== oldRangeUpper) {
            this.dispatchChange(
                ParameterSlider.ChangeRange,
                this.range
            );
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
                return 0;
            }
            const ratio = (value - this.min) / (this.max - this.min);
            return ratio * (rect!.width - thickness!);
        };
        this.handles.current!.style.left = xPosition(this.value) + "px";
        this.handles.original!.style.left = xPosition(this.originalValue) + "px";

        this.handles.slider!.classList.toggle("disabled", this.disabled);

        if (this.range) {
            this.handles.range!.style.display = "block";
            const left = xPosition(this.range[0]);
            const right = xPosition(this.range[1]);
            this.handles.range!.style.left = left + "px";
            this.handles.range!.style.width = (right - left + thickness) + "px";
        } else {
            this.handles.range!.style.display = "none";
        }
    }

}
