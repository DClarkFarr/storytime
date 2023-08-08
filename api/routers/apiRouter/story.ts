import { Router } from "express";
import { HasSessionRequest, hasSession } from "../../middleware/hasSession";
import { ObjectId } from "mongodb";
import { StoryDocumentSchema } from "../../types/Story";
import { getStoriesCollection } from "../../db/collections";
import DbError from "../../errors/DbError";
import { toStoryObject } from "../../db/story";

const router = Router();

router.use(hasSession);

router.get("/", async (req: HasSessionRequest, res) => {
    // get story
});

router.post("/", async (req: HasSessionRequest, res) => {
    // create story

    const storyDoc: StoryDocumentSchema = {
        userId: new ObjectId(req.user._id),
        name: "New Story",
        description: "Description here...",
        createdAt: new Date(),
    };

    const storiesCollection = await getStoriesCollection();

    try {
        const { insertedId } = await storiesCollection.insertOne(storyDoc);

        const story = await storiesCollection.findOne({ _id: insertedId });

        res.json({ row: toStoryObject(story) });
    } catch (err) {
        throw new DbError(err.message);
    }
});

export default router;
