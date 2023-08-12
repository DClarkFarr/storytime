import {
    StoryDocument,
    StoryDocumentWithScenes,
    WithScenes,
} from "../types/Story";
import { getScenesCollection } from "./collections";
import { toSceneObject } from "./scene";

export function toStoryObject<T extends StoryDocument>(story: T) {
    const obj = { ...story } as Record<string, any>;

    obj.id = story._id.toString();

    if (obj.scenes) {
        obj.scenes = obj.scenes.map(toSceneObject);
    }

    delete obj._id;

    return obj;
}

export async function populateStoryScenes<
    T extends StoryDocument = StoryDocument
>(story: T): Promise<WithScenes<T>> {
    const scenesColletion = await getScenesCollection();

    const modded = story as WithScenes<T>;
    modded.scenes = [];

    try {
        modded.scenes = await scenesColletion
            .find({ storyId: modded._id, userId: modded.userId })
            .sort({ createdAt: -1 })
            .toArray();
    } catch (err) {
        console.error("error loading story scenes", err);
    }

    return modded;
}
