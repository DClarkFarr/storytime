import { SceneDocumentSchema } from "../types/Scene";
import {
    StoryDocument,
    StoryDocumentSchema,
    StoryDocumentWithScenes,
    WithScenes,
} from "../types/Story";
import { getScenesCollection, getStoriesCollection } from "./collections";
import { duplicateScene, toSceneObject } from "./scene";

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

export async function duplicateStory(
    oldStory: StoryDocument
): Promise<StoryDocumentWithScenes> {
    const storiesCollection = await getStoriesCollection();
    const scenesCollection = await getScenesCollection();

    const toSet: StoryDocumentSchema = { ...oldStory, createdAt: new Date() };
    delete toSet._id;

    let matches: RegExpMatchArray;
    if ((matches = oldStory.match(/^Copy (d+) of/))) {
        const num = parseInt(matches[1]) + 1;
        toSet.name = toSet.name.replace(num[0], `Copy ${num} of`);
    } else if ((matches = oldStory.match(/^Copy of/))) {
        toSet.name = toSet.name.replace(matches[0], "Copy 2 of");
    } else {
        toSet.name = `Copy of ${toSet.name}`;
    }

    const { insertedId } = await storiesCollection.insertOne(toSet);

    const createdStory = await storiesCollection.findOne({
        _id: insertedId,
    });

    const oldScenes = await scenesCollection
        .find({
            storyId: oldStory._id,
            userId: oldStory.userId,
        })
        .sort({ createdAt: -1 })
        .toArray();

    const newScenes = await Promise.all(oldScenes.map(duplicateScene));

    return {
        ...createdStory,
        scenes: newScenes,
    };
}
