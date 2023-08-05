import {
    CanvasShapeElement,
    CanvasShapeTypes,
    CanvasTextElement,
} from "@/types/Canvas";
import { v4 as uuidv4 } from "uuid";

export function createTextElement(): CanvasTextElement {
    return {
        id: uuidv4(),
        index: -1,
        type: "text",
        position: {
            x: 0,
            y: 0,
            width: 100,
            height: 20,
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        font: {
            size: 12,
            family: "Arial",
            color: "#000000",
            weight: "normal",
        },
        value: "Text string",
    };
}

export function createShapeElement(
    value: CanvasShapeTypes
): CanvasShapeElement {
    return {
        id: uuidv4(),
        index: -1,
        type: "shape",
        value,
        position: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        shape: {
            fill: "#efefef",
            stroke: "#333333",
            strokeWidth: 1,
            background: "#aaaaaa",
        },
    };
}

export function createImageElement() {}

export function createDrawElement() {}
