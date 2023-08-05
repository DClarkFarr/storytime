import { Document, WithId } from "mongodb";

export interface UserDocumentSchema extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
}

export type UserDocument = WithId<UserDocumentSchema>;
