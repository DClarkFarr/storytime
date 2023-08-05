export interface CanvasBaseElement {
    id: string;
    index: number;
    type: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
    };
    opacity: number;
    selectable: boolean;
}
export interface CanvasTextElement extends CanvasBaseElement {
    type: "text";
    font: {
        size: number;
        font: string;
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

export type CanvasElement =
    | CanvasTextElement
    | CanvasImageElement
    | CanvasDrawElement
    | CanvasGroupElement;

export type CanvasElementTypes = "gropu" | "text" | "image" | "draw";
