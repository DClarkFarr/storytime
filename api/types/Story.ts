import { Document, ObjectId, WithId } from "mongodb";

export interface StoryDocumentSchema extends Document {
    userId: ObjectId;
    name: string;
    description: string;
    createdAt: Date;
}

export type StoryDocument = WithId<StoryDocumentSchema>;
