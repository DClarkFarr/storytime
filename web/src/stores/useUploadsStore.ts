import httpClient from "@/services/httpClient";
import { Upload } from "@/types/Upload";
import { defineStore } from "pinia";
import { ref } from "vue";
import { v4 as uuid } from "uuid";

export type UploadingFile = {
    id: string;
    filename: string;
    status: "uploading" | "success" | "error";
};

const useUploadsStore = defineStore("uploads", () => {
    const uploads = ref<Upload[]>([]);

    const uploadingFiles = ref<UploadingFile[]>([]);

    const setUploads = (u: Upload[]) => {
        uploads.value = u;
    };

    const createUploadingFile = (file: File): UploadingFile => {
        return {
            id: uuid(),
            filename: file.name,
            status: "uploading",
        };
    };

    const setUploadingFileStatus = (
        id: string,
        status: UploadingFile["status"]
    ) => {
        const file = uploadingFiles.value.find((f) => f.id === id);
        const index = uploadingFiles.value.findIndex((f) => f.id === id);

        if (!file) {
            return false;
        }
        file.status = status;

        uploadingFiles.value[index] = file;
    };

    const uploadFile = async (
        file: File,
        opts: { name?: string; alt?: string } = {}
    ) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("name", opts.name || "");
        fd.append("alt", opts.alt || "");

        const uploadingFile = createUploadingFile(file);

        uploadingFiles.value.push(uploadingFile);

        const promise = httpClient.post("/upload", fd).then(({ data }) => data);

        promise
            .then((data) => {
                console.log("got data", data);
                setUploadingFileStatus(uploadingFile.id, "success");
            })
            .catch((err) => {
                setUploadingFileStatus(uploadingFile.id, "error");
                throw err;
            });

        return {
            onUpload: promise,
            uploadingFile,
        };
    };

    return {
        uploads,
        setUploads,
        uploadFile,
    };
});

export default useUploadsStore;
