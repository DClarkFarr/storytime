import { CanvasTextElement } from "@/types/Canvas";
import { v4 as uuidv4 } from "uuid";

export function createTextElement(): CanvasTextElement {
    return {
        id: uuidv4(),
        index: -1,
        type: "text",
        position: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        font: {
            size: 12,
            font: "Arial",
            color: "#000000",
            weight: "normal",
        },
        value: "Text string",
    };
}

export function createImageElement() {}

export function createDrawElement() {}
