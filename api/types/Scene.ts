import { Document, ObjectId, WithId } from "mongodb";

export interface SceneDocumentSchema extends Document {
    storyId: ObjectId;
    userId: ObjectId;
    name: string;
    description: string;
    image: string;
    elements: object[];
    createdAt: Date;
}

export type SceneDocument = WithId<SceneDocumentSchema>;
