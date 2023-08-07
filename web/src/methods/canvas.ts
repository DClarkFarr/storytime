import {
    CanvasBaseElement,
    CanvasElement,
    CanvasShapeElement,
    CanvasShapeTypes,
    CanvasTextElement,
    FabricCircleElement,
    FabricObject,
    FabricRectElement,
    FabricTextElement,
    FabricTriangleElement,
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

export function syncCanvasElementPositionToElement(
    canvasElement: FabricObject,
    element: CanvasElement
) {
    Object.assign(element.position, {
        y: canvasElement.top,
        x: canvasElement.left,
        rotation: canvasElement.angle,
        width: canvasElement.width,
        height: canvasElement.height,
        scaleX: canvasElement.scaleX,
        scaleY: canvasElement.scaleY,
    });
}

export function syncCanvasTextToElement(
    canvasElement: FabricTextElement,
    element: CanvasTextElement
) {
    Object.assign(element.font, {
        size: canvasElement.fontSize,
        weight: canvasElement.fontWeight,
        family: canvasElement.fontFamily,
        color: canvasElement.fill,
    });

    element.value = canvasElement.text || "";
}

export function getCanvasElementShapeType(
    canvasElement:
        | FabricRectElement
        | FabricCircleElement
        | FabricTriangleElement
): CanvasShapeTypes {
    if (canvasElement instanceof fabric.Rect) {
        return "square";
    } else if (canvasElement instanceof fabric.Circle) {
        return "circle";
    } else if (canvasElement instanceof fabric.Triangle) {
        return "triangle";
    }

    throw new Error("Unknown shape type");
}

export function syncCanvasShapeToElement(
    canvasElement:
        | FabricRectElement
        | FabricCircleElement
        | FabricTriangleElement,
    element: CanvasShapeElement
) {
    Object.assign(element.shape, {
        fill: canvasElement.fill,
        stroke: canvasElement.stroke,
        strokeWidth: canvasElement.strokeWidth,
        background: canvasElement.backgroundColor,
    });

    element.value = getCanvasElementShapeType(canvasElement);
}

export function syncCanvasElementToElement(
    canvasElement: FabricObject,
    element: CanvasElement
) {
    syncCanvasElementPositionToElement(canvasElement, element);

    if (element.type === "text") {
        syncCanvasTextToElement(canvasElement as FabricTextElement, element);
    } else if (element.type === "shape") {
        syncCanvasShapeToElement(canvasElement as FabricRectElement, element);
    }
}
