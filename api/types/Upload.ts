import { Document, ObjectId, WithId } from "mongodb";

export interface UploadDocumentSchema extends Document {
    userId: ObjectId;
    name: string;
    alt: string;
    src: string;
    createdAt: Date;
}

export type UploadDocument = WithId<UploadDocumentSchema>;
