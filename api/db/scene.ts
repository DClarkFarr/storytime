import { SceneDocument, SceneDocumentSchema } from "../types/Scene";
import { getScenesCollection } from "./collections";

export function toSceneObject(scene: SceneDocument) {
    scene.id = scene._id.toString();

    scene.elements = scene.elements || [];

    delete scene._id;

    return scene;
}

export async function duplicateScene(oldScene: SceneDocument) {
    const scenesCollection = await getScenesCollection();
    const toSet: SceneDocumentSchema = { ...oldScene };
    delete toSet._id;
    toSet.createdAt = new Date();

    let matches: RegExpMatchArray;
    if ((matches = toSet.name.match(/^Copy (d+) of/))) {
        const num = parseInt(matches[1]) + 1;
        toSet.name = toSet.name.replace(num[0], `Copy ${num} of`);
    } else if ((matches = toSet.name.match(/^Copy of/))) {
        toSet.name = toSet.name.replace(matches[0], "Copy 2 of");
    } else {
        toSet.name = `Copy of ${toSet.name}`;
    }

    const { insertedId } = await scenesCollection.insertOne(toSet);

    return await scenesCollection.findOne({
        _id: insertedId,
    });
}
