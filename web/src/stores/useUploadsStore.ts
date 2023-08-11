import httpClient from "@/services/httpClient";
import { Upload } from "@/types/Upload";
import { defineStore } from "pinia";
import { ref } from "vue";
import { v4 as uuid } from "uuid";
import { AxiosResponse } from "axios";

export type UploadingFile = {
    id: string;
    filename: string;
    status: "uploading" | "success" | "error";
    src: string;
};

const useUploadsStore = defineStore("uploads", () => {
    const uploads = ref<Upload[]>([]);
    const uploadingFiles = ref<UploadingFile[]>([]);
    const loaded = ref(false);

    const setUploads = (u: Upload[]) => {
        uploads.value = u;
    };

    const createUploadingFile = (file: File): UploadingFile => {
        return {
            id: uuid(),
            filename: file.name,
            status: "uploading",
            src: "",
        };
    };

    const removeUploadingFile = (id: string) => {
        const index = uploadingFiles.value.findIndex((f) => f.id === id);

        if (index === -1) {
            return false;
        }

        uploadingFiles.value.splice(index, 1);
    };

    const removeUploadingFiles = () => {
        uploadingFiles.value = [];
    };

    const setUploadingFileStatus = (
        id: string,
        status: UploadingFile["status"],
        src?: string
    ) => {
        const file = uploadingFiles.value.find((f) => f.id === id);
        const index = uploadingFiles.value.findIndex((f) => f.id === id);

        if (!file) {
            return false;
        }
        file.status = status;

        if (src) {
            file.src = src;
        }

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

        const promise = httpClient
            .post<any, AxiosResponse<{ row: Upload }>>("/upload/file", fd)
            .then(({ data }) => data.row);

        promise
            .then((data) => {
                setUploadingFileStatus(uploadingFile.id, "success", data.src);

                uploads.value = [data, ...uploads.value];

                return data;
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

    const loadUploads = async () => {
        await httpClient
            .get<any, AxiosResponse<{ rows: Upload[] }>>("/user/images")
            .then(({ data: { rows } }) => {
                uploads.value = rows;
            })
            .finally(() => {
                loaded.value = true;
            });
    };

    const maybeLoadUploads = () => {
        if (loaded.value) {
            return;
        }

        loadUploads();
    };

    return {
        uploads,
        uploadingFiles,
        setUploads,
        uploadFile,
        removeUploadingFile,
        removeUploadingFiles,
        loadUploads,
        maybeLoadUploads,
    };
});

export default useUploadsStore;
