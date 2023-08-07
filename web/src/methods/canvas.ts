import {
    CanvasBaseElement,
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
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        font: {
            size: 16,
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
            stroke: "transparent",
            strokeWidth: 1,
            background: "#aaaaaa",
        },
    };
}

export function mapElementPositionToCanvasElement(
    position: CanvasShapeElement["position"]
) {
    return {
        top: position.y,
        left: position.x,
        angle: position.rotation,
        width: position.width,
        height: position.height,
        scaleX: position.scaleX || 1,
        scaleY: position.scaleY || 1,
    };
}
export function mapElementGenericFieldsToCanvasElement(
    data: CanvasBaseElement
) {
    return {
        event: data.selectable,
        selectable: data.selectable,
        opacity: data.opacity,
    };
}

export function createShapeCanvasElement(
    data: CanvasShapeElement
): FabricRectElement {
    const obj = new fabric.Rect({
        ...mapElementPositionToCanvasElement(data.position),
        ...mapElementGenericFieldsToCanvasElement(data),
        fill: data.shape.fill,
        stroke: data.shape.stroke,
        strokeWidth: data.shape.strokeWidth,
        backgroundColor: data.shape.background,
    });

    return Object.assign(obj, { uuid: data.id });
}

export function createTextCanvasElement(
    data: CanvasTextElement
): FabricTextElement {
    const obj = new fabric.IText(data.value, {
        ...mapElementPositionToCanvasElement(data.position),
        ...mapElementGenericFieldsToCanvasElement(data),
        fontSize: data.font.size,
        fontWeight: data.font.weight,
        fontFamily: data.font.family,
        fill: data.font.color,
    });

    return Object.assign(obj, { uuid: data.id });
}

export function createImageElement() {}

export function createDrawElement() {}
