import { SceneDocument } from "../types/Scene";

export function toSceneObject(scene: SceneDocument) {
    scene.id = scene._id.toString();

    scene.elements = scene.elements || [];

    delete scene._id;

    return scene;
}
