import { Document, ObjectId, WithId } from "mongodb";

export interface SceneDocumentSchema extends Document {
    storyId: ObjectId;
    userId: ObjectId;
    name: string;
    description: string;
    createdAt: Date;
}

export type SceneDocument = WithId<SceneDocumentSchema>;
