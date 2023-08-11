import { UploadDocument } from "../types/Upload";

export function toUploadObject(upload: UploadDocument) {
    const obj = { ...upload };
    obj.id = obj._id.toString();
    delete obj._id;

    return { ...obj, userId: obj.userId.toString() };
}
