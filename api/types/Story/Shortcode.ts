import { Document, ObjectId, WithId } from "mongodb";

export interface ShortcodeDocumentSchema extends Document {
    storyId: ObjectId;
    userId: ObjectId;
    pointId: ObjectId;
    slug: string;
    returnType: string;
    formatState: string;
    initState: string;
    createdAt: Date;
}

export type ShortcodeDocument = WithId<ShortcodeDocumentSchema>;
