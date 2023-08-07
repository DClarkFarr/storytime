import {
    CanvasShapeElement,
    CanvasShapeTypes,
    CanvasTextElement,
    FabricRectElement,
    FabricTextElement,
} from "@/types/Canvas";
import { v4 as uuidv4 } from "uuid";
import { fabric } from "fabric";

export function createTextElement(): CanvasTextElement {
    return {
        id: uuidv4(),
        index: -1,
        type: "text",
        position: {
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        font: {
            size: 24,
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
            x: 100,
            y: 100,
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

export function createShapeCanvasElement(
    data: CanvasShapeElement
): FabricRectElement {
    const obj = new fabric.Rect({
        top: data.position.y,
        left: data.position.x,
        angle: data.position.rotation,
        width: data.position.width,
        height: data.position.height,
        fill: data.shape.fill,
        stroke: data.shape.stroke,
        strokeWidth: data.shape.strokeWidth,
        backgroundColor: data.shape.background,
        opacity: data.opacity,
        evented: true,
        // selectable: data.selectable,
        // evented: data.selectable,
        // scaleX: 1,
        // scaleY: 1,
    });

    return Object.assign(obj, { uuid: data.id });
}

export function createTextCanvasElement(
    data: CanvasTextElement
): FabricTextElement {
    const obj = new fabric.Text(data.value, {
        top: data.position.y,
        left: data.position.x,
        angle: data.position.rotation,
        width: data.position.width,
        height: data.position.height,
        fontSize: data.font.size,
        fontWeight: data.font.weight,
        fontFamily: data.font.family,
        fill: data.font.color,
        opacity: data.opacity,
    });

    return Object.assign(obj, { uuid: data.id });
}

export function createImageElement() {}

export function createDrawElement() {}
