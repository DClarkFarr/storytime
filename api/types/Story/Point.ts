import { Document, ObjectId, WithId } from "mongodb";

export interface PointDocumentSchema extends Document {
    storyId: ObjectId;
    userId: ObjectId;
    sceneId: ObjectId;
    row: number;
    col: number;
    actions: object[];
    shortcodes: object[];
    createdAt: Date;
}

export type PointDocument = WithId<PointDocumentSchema>;
