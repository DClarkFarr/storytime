import { CanvasElement } from "./Canvas";

export type Scene = {
    id: string;
    userId: string;
    storyId: string;
    name: string;
    description: string;
    image: string;
    createdAt: Date;
};
export type SceneWithElements = Scene & {
    elements: CanvasElement[];
};
