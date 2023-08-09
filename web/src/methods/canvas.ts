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
    FabricShapeElement,
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

export function syncElementPositionToCanvasElement(
    element: CanvasElement,
    canvasElement: FabricObject
) {
    const mappedPosition = mapElementPositionToCanvasElement(element.position);

    delete mappedPosition.width;
    delete mappedPosition.height;
    delete mappedPosition.radius;

    const posiionChanges = Object.entries(mappedPosition).reduce(
        (acc, [key, value]) => {
            if (canvasElement[key as keyof typeof canvasElement] !== value) {
                acc[key as keyof typeof mappedPosition] = value;
            }
            return acc;
        },
        {} as Partial<typeof mappedPosition>
    );

    if (Object.keys(posiionChanges).length > 0) {
        console.log(
            "got changes",
            posiionChanges,
            "from",
            canvasElement.top,
            "and left",
            canvasElement.left
        );
        canvasElement.set(posiionChanges);
        canvasElement.setCoords();
    }
}

export function syncElementSelectableToCanvasElement(
    element: CanvasElement,
    canvasElement: FabricObject
) {
    if (element.selectable != canvasElement.selectable) {
        canvasElement.set({
            selectable: element.selectable,
            evented: element.selectable,
        });
    }
}

export function syncElementOpacityToCanvasElement(
    element: CanvasElement,
    canvasElement: FabricObject
) {
    if (element.opacity != canvasElement.opacity) {
        canvasElement.set({ opacity: element.opacity });
    }
}

export async function syncElementToCanvasElement(
    element: CanvasElement,
    canvasElement: FabricObject
) {
    syncElementPositionToCanvasElement(element, canvasElement);
    syncElementSelectableToCanvasElement(element, canvasElement);
    syncElementOpacityToCanvasElement(element, canvasElement);

    if (element.type === "text") {
        await syncElementTextToCanvasElement(
            element,
            canvasElement as FabricTextElement
        );
    } else if (element.type === "shape") {
        await syncElementShapeToCanvasElement(
            element,
            canvasElement as FabricShapeElement
        );
    } else if (element.type === "image") {
        await syncElementImageToCanvasElement(
            element,
            canvasElement as FabricImageElement
        );
    } else {
        throw new Error("Unknown element type: " + element.type);
    }

    console.log(
        "after syncing we got top",
        canvasElement.top,
        "and left",
        canvasElement.left
    );
}

export async function syncElementTextToCanvasElement(
    element: CanvasTextElement,
    canvasElement: FabricTextElement
) {
    canvasElement.set({
        text: element.value,
        fontSize: element.font.size,
        fontWeight: element.font.weight,
        fontFamily: element.font.family,
        fill: element.font.color,
    });
}
export async function syncElementShapeToCanvasElement(
    element: CanvasShapeElement,
    canvasElement: FabricShapeElement
) {
    if (element.value === "circle") {
        (canvasElement as FabricCircleElement).set({
            radius: element.position.radius,
        });
    } else {
        (canvasElement as FabricRectElement | FabricTriangleElement).set({
            height: element.position.height,
            width: element.position.width,
        });
    }

    (canvasElement as fabric.Object).set({
        backgroundColor: element.shape.background,
        fill: element.shape.fill,
        stroke: element.shape.stroke,
        strokeWidth: element.shape.strokeWidth,
    });
}
export async function syncElementImageToCanvasElement(
    element: CanvasImageElement,
    canvasElement: FabricImageElement
) {
    canvasElement.set({
        backgroundColor: element.image.backgroundColor,
    });

    if (element.value != canvasElement.getSrc()) {
        console.log("setting new src", element.value);

        await new Promise((resolve) => {
            canvasElement.setSrc(
                element.value,
                () => {
                    canvasElement.setCoords();
                    resolve(null);
                },
                { crossOrigin: "anonymous" }
            );
        });
    }
}
