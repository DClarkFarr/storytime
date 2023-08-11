import { Document, WithId } from "mongodb";

export interface UploadDocumentSchema extends Document {
    userId: string;
    name: string;
    alt: string;
    src: string;
    createdAt: Date;
}

export type UploadDocument = WithId<UploadDocumentSchema>;
