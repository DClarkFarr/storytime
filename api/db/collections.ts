import { SceneDocumentSchema } from "../types/Scene";
import { StoryDocumentSchema } from "../types/Story";
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
