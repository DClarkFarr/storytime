import {
    CanvasBaseElement,
    CanvasElement,
    CanvasImageElement,
    CanvasShapeElement,
    CanvasShapeTypes,
    CanvasTextElement,
    FabricCircleElement,
    FabricImageElement,
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

export function createImageElement(): CanvasImageElement {
    return {
        id: uuidv4(),
        type: "image",
        position: {
            x: 0,
            y: 0,
            rotation: 0,
            height: 100,
            width: 100,
        },
        image: {
            alt: "",
            backgroundColor: "lightblue",
        },
        opacity: 1,
        selectable: true,
        value: import.meta.env.VITE_API_BASE + "/placeholder.jpg",
    };
}

export function createShapeElement(value: CanvasShapeTypes) {
    const obj: CanvasShapeElement = {
        id: uuidv4(),
        type: "shape",
        value,
        position: {
            x: 0,
            y: 0,
            rotation: 0,
        },
        opacity: 1,
        selectable: true,
        shape: {
            fill: "#efefef",
            stroke: "#999999",
            strokeWidth: 1,
            background: "transparent",
        },
    };

    if (value === "circle") {
        obj.position.radius = 50;
    } else {
        obj.position.width = 100;
        obj.position.height = 100;
    }

    return obj;
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
        radius: position.radius,
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

export async function createShapeCanvasElement(
    data: CanvasShapeElement
): Promise<FabricRectElement> {
    const objectData = {
        ...mapElementPositionToCanvasElement(data.position),
        ...mapElementGenericFieldsToCanvasElement(data),
        fill: data.shape.fill,
        stroke: data.shape.stroke,
        strokeWidth: data.shape.strokeWidth,
    };

    let obj: fabric.Object;
    if (data.value === "circle") {
        obj = new fabric.Circle(objectData);
    } else if (data.value === "triangle") {
        obj = new fabric.Triangle(objectData);
    } else {
        obj = new fabric.Rect(objectData);
    }

    return Object.assign(obj, { uuid: data.id });
}

export async function createTextCanvasElement(
    data: CanvasTextElement
): Promise<FabricTextElement> {
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

export function getImageLayout(
    width: number = 0,
    height: number = 0
): "landscape" | "portrait" | "square" {
    if (width > height) {
        return "landscape";
    } else if (height > width) {
        return "portrait";
    } else {
        return "square";
    }
}
export async function createImageCanvasElement(
    data: CanvasImageElement
): Promise<FabricImageElement> {
    const imgElement = await new Promise<HTMLImageElement>((resolve) => {
        fabric.util.loadImage(
            data.value,
            (img) => {
                resolve(img);
            },
            null,
            "anonymous"
        );
    });

    let img: fabric.Image;

    if (imgElement) {
        const { height, width } = data.position;
        delete data.position.height;
        delete data.position.width;

        img = new fabric.Image(imgElement, {
            ...mapElementPositionToCanvasElement(data.position),
            ...mapElementGenericFieldsToCanvasElement(data),
            backgroundColor: data.image.backgroundColor,
        });

        if (height) {
            img.scaleToHeight(height);
        }
        if (width) {
            img.scaleToWidth(width);
        }
    } else {
        img = new fabric.Image("", {
            ...mapElementPositionToCanvasElement({
                ...data.position,
                height: 100,
                width: 100,
            }),
            ...mapElementGenericFieldsToCanvasElement(data),
            backgroundColor: data.image.backgroundColor,
        });
    }

    return Object.assign(img, { uuid: data.id });
}

export async function createDrawElement() {}

export function syncCanvasElementPositionToElement(
    canvasElement: FabricObject,
    element: CanvasElement
) {
    Object.assign(element.position, {
        y: canvasElement.top,
        x: canvasElement.left,
        rotation: canvasElement.angle,
        scaleX: canvasElement.scaleX,
        scaleY: canvasElement.scaleY,
    });

    if (element.type === "shape" && element.value === "circle") {
        Object.assign(element.position, {
            radius: (canvasElement as FabricCircleElement).radius,
        });
    } else {
        Object.assign({
            width: canvasElement.width,
            height: canvasElement.height,
        });
    }
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

export function syncCanvasImageToElement(
    canvasElement: FabricImageElement,
    element: CanvasImageElement
) {
    Object.assign(element.image, {
        backgroundColor: canvasElement.backgroundColor,
    });

    element.value = canvasElement.getSrc() || "";
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
    } else if (element.type === "image") {
        syncCanvasImageToElement(canvasElement as FabricImageElement, element);
    } else {
        throw new Error("Unknown element type: " + element.type);
    }
}
