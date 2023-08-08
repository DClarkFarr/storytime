import { Scene } from "./Scene";

export type Story = {
    id: string;
    userId: string;
    name: string;
    description: string;
    createdAt: Date;
};

export type StoryWithScenes<T extends Scene = Scene> = Story & {
    scenes: T[];
};
