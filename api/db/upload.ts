import { UploadDocument } from "../types/Upload";

export function toUploadObject(upload: UploadDocument) {
    upload.id = upload._id.toString();
    upload.userId = upload.userId.toString();

    return upload;
}
