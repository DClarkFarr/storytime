import { fabric } from "fabric";

export interface CanvasBaseElement {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        rotation: number;
        scaleX?: number;
        scaleY?: number;
        radius?: number;
    };
    opacity: number;
    selectable: boolean;
}
export interface CanvasTextElement extends CanvasBaseElement {
    type: "text";
    font: {
        size: number;
        family: string;
        color: string;
        weight: string;
    };
    value: string;
}
export interface CanvasImageElement extends CanvasBaseElement {
    type: "image";
    image: {
        alt: string;
    };
    value: string;
}

export interface CanvasDrawElement extends CanvasBaseElement {
    type: "draw";

    value: string[];
    opacity: number;
}

export interface CanvasGroupElement extends CanvasBaseElement {
    type: "group";
    value: CanvasElement[];
    opacity: number;
}

export type CanvasShapeTypes = "square" | "circle" | "triangle";

export interface CanvasShapeElement extends CanvasBaseElement {
    type: "shape";
    value: CanvasShapeTypes;
    shape: {
        fill: string;
        background: string;
        stroke: string;
        strokeWidth: number;
    };
}

export type CanvasElement =
    | CanvasTextElement
    | CanvasImageElement
    | CanvasDrawElement
    | CanvasGroupElement
    | CanvasShapeElement;

export type CanvasElementTypes = "group" | "text" | "image" | "draw" | "shape";

export interface FabricTextElement extends fabric.Text {
    uuid: string;
}
export interface FabricImageElement extends fabric.Image {
    uuid: string;
}
export interface FabricRectElement extends fabric.Rect {
    uuid: string;
}
export interface FabricCircleElement extends fabric.Circle {
    uuid: string;
}
export interface FabricTriangleElement extends fabric.Triangle {
    uuid: string;
}
export interface FabricObject extends fabric.Object {
    uuid: string;
}
