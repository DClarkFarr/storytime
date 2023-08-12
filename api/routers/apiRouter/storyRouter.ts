import { Router } from "express";
import { HasSessionRequest, hasSession } from "../../middleware/hasSession";
import { ObjectId } from "mongodb";
import { StoryDocumentSchema } from "../../types/Story";
import {
    getPointsCollection,
    getScenesCollection,
    getStoriesCollection,
} from "../../db/collections";
import DbError from "../../errors/DbError";
import { toStoryObject, populateStoryScenes } from "../../db/story";
import UserError from "../../errors/UserError";
import { toSceneObject } from "../../db/scene";
import { toPointObject } from "../../db/point";

const router = Router();

router.use(hasSession);

router.get("/:id", async (req: HasSessionRequest, res) => {
    const storiesCollection = await getStoriesCollection();

    const story = await storiesCollection.findOne({
        userId: req.user._id,
        _id: new ObjectId(req.params.id),
    });

    if (!story) {
        throw new UserError("Story not found", 404);
    }

    const populatedStory = await populateStoryScenes(story);

    res.json({ row: toStoryObject(populatedStory) });
});

router.post("/:id/scene", async (req: HasSessionRequest, res) => {
    const scenesCollection = await getScenesCollection();

    const { insertedId } = await scenesCollection.insertOne({
        storyId: new ObjectId(req.params.id),
        userId: req.user._id,
        name: "New Scene",
        description: "Description here...",
        image: "",
        elements: [],
        createdAt: new Date(),
    });

    try {
        const scene = await scenesCollection.findOne({
            _id: insertedId,
            userId: req.user._id,
        });

        if (!scene) {
            throw new UserError("Scene not found", 404);
        }

        res.json({ row: toSceneObject(scene) });
    } catch (err) {
        throw new DbError(err.message);
    }
});

router.get("/:id/point", async (req: HasSessionRequest, res) => {
    const pointsCollection = await getPointsCollection();
    const storiesCollection = await getStoriesCollection();

    try {
        const story = await storiesCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: req.user._id,
        });

        if (!story) {
            throw new UserError("story not found", 404);
        }

        const points = await pointsCollection
            .find({ storyId: story._id, userId: req.user._id })
            .toArray();

        res.json({ rows: points.map(toPointObject) });
    } catch (err) {
        throw new DbError(err.message);
    }
});

router.get("/", async (req: HasSessionRequest, res) => {
    const storiesCollection = await getStoriesCollection();

    const stories = await storiesCollection
        .find({ userId: req.user._id })
        .sort("createdAt", -1)
        .toArray();

    res.json({ rows: stories.map(toStoryObject) });
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
