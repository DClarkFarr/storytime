import { SceneDocumentSchema } from "../types/Scene";
import { StoryDocumentSchema } from "../types/Story";
import { PointDocumentSchema } from "../types/Story/Point";
import { UploadDocumentSchema } from "../types/Upload";
import { UserDocumentSchema } from "../types/User";
import { getDb } from "./connect";

export const getUsersCollection = async () => {
    return (await getDb()).collection<UserDocumentSchema>("users");
};

export const getStoriesCollection = async () => {
    return (await getDb()).collection<StoryDocumentSchema>("stories");
};

export const getScenesCollection = async () => {
    return (await getDb()).collection<SceneDocumentSchema>("scenes");
};

export const getUploadsCollection = async () => {
    return (await getDb()).collection<UploadDocumentSchema>("uploads");
};

export const getPointsCollection = async () => {
    return (await getDb()).collection<PointDocumentSchema>("points");
};
