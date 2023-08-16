import { Scene } from "./Scene";

export type Story = {
    id: string;
    userId: string;
    name: string;
    description: string;
    createdAt: string;
};

export type StoryWithScenes<T extends Scene = Scene> = Story & {
    scenes: T[];
};

export type PointAction = {
    text: string;
    toPointId: string;
};

export type Point = {
    id: string;
    userId: string;
    storyId: string;
    sceneId: string;
    row: number;
    col: number;
    actions: PointAction[];
    createdAt: Date;
};

export type PointWithScene<P extends Point = Point> = P & {
    scene: Scene | null;
};
