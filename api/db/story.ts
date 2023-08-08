import { StoryDocument } from "../types/Story";

export function toStoryObject(story: StoryDocument) {
    story.id = story._id.toString();

    delete story._id;

    return story;
}
