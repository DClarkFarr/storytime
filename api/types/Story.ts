import { Document, ObjectId, WithId } from "mongodb";
import { SceneDocument } from "./Scene";

export interface StoryDocumentSchema extends Document {
    userId: ObjectId;
    name: string;
    description: string;
    createdAt: Date;
}

export type StoryDocument = WithId<StoryDocumentSchema>;

export type WithScenes<T extends StoryDocument> = T & {
    scenes: SceneDocument[];
};

export type StoryDocumentWithScenes = WithScenes<StoryDocument>;
