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
import {
    toStoryObject,
    populateStoryScenes,
    duplicateStory,
} from "../../db/story";
import UserError from "../../errors/UserError";
import { duplicateScene, toSceneObject } from "../../db/scene";
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

router.put("/:id", async (req: HasSessionRequest, res, next) => {
    const storiesCollection = await getStoriesCollection();

    const name = req.body.name;
    const description = req.body.description;

    try {
        const story = await storiesCollection.findOne({
            userId: req.user._id,
            _id: new ObjectId(req.params.id),
        });

        if (!story) {
            throw new UserError("Story not found", 404);
        }

        if (!name || !description) {
            throw new UserError("Invalid name or description", 400);
        }

        await storiesCollection.updateOne(
            { _id: story._id },
            {
                $set: {
                    name,
                    description,
                },
            }
        );

        res.json({ row: toStoryObject({ ...story, name, description }) });
    } catch (err) {
        next(err);
    }
});

router.post("/:id/scene", async (req: HasSessionRequest, res, next) => {
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
        next(err);
    }
});

/**
 * Duplicate a scene
 */

router.post(
    "/:storyId/scene/:id/copy",
    async (req: HasSessionRequest, res, next) => {
        const scenesCollection = await getScenesCollection();

        try {
            const scene = await scenesCollection.findOne({
                userId: req.user._id,
                _id: new ObjectId(req.params.id),
            });

            if (!scene) {
                throw new UserError("Scene not found", 404);
            }

            const copiedScene = await duplicateScene(scene);

            res.json({
                row: toSceneObject(copiedScene),
            });
        } catch (err) {
            next(err);
        }
    }
);

/**
 * Get story points
 */
router.get("/:id/point", async (req: HasSessionRequest, res, next) => {
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
        next(err.message);
    }
});

/**
 * Create story point
 */
router.post("/:id/point", async (req: HasSessionRequest, res, next) => {
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

        const row = req.body.row || 0;
        const col = req.body.col || 0;

        const { insertedId } = await pointsCollection.insertOne({
            storyId: story._id,
            userId: req.user._id,
            sceneId: null,
            row,
            col,
            actions: [],
            createdAt: new Date(),
        });

        const point = await pointsCollection.findOne({
            _id: insertedId,
            userId: req.user._id,
        });

        res.json({ row: toPointObject(point) });
    } catch (err) {
        next(err.message);
    }
});

router.put("/:id/point/:pointId", async (req: HasSessionRequest, res, next) => {
    const pointsCollection = await getPointsCollection();

    try {
        const existing = await pointsCollection.findOne({
            _id: new ObjectId(req.params.pointId),
            userId: req.user._id,
            storyId: new ObjectId(req.params.id),
        });

        if (!existing) {
            throw new UserError("point not found", 404);
        }

        const toSet = {};

        if (req.body.sceneId) {
            try {
                const scene = (await getScenesCollection()).findOne({
                    _id: new ObjectId(req.body.sceneId),
                    userId: req.user._id,
                });

                if (!scene) {
                    throw new UserError("Scene ID not found", 404);
                }
            } catch {
                throw new UserError("Invalid scene ID", 400);
            }
            toSet["sceneId"] = new ObjectId(req.body.sceneId);
        }

        if (req.body.row) {
            if (typeof req.body.row !== "number") {
                throw new UserError("Invalid row value", 400);
            }
            toSet["row"] = req.body.row;
        }

        if (req.body.col) {
            if (typeof req.body.col !== "number") {
                throw new UserError("Invalid col value", 400);
            }
            toSet["col"] = req.body.col;
        }

        if (req.body.actions) {
            if (!Array.isArray(req.body.actions)) {
                throw new UserError("Invalid actions", 400);
            }
            toSet["actions"] = req.body.actions;
        }

        await pointsCollection.updateOne(
            { _id: existing._id },
            {
                $set: toSet,
            }
        );

        res.json({ row: toPointObject({ ...existing, ...toSet }) });
    } catch (err) {
        next(err.message);
    }
});

router.post(
    "/:id/point/:pointId/action",
    async (req: HasSessionRequest, res, next) => {
        const pointsCollection = await getPointsCollection();

        try {
            const existing = await pointsCollection.findOne({
                _id: new ObjectId(req.params.pointId),
                userId: req.user._id,
                storyId: new ObjectId(req.params.id),
            });

            if (!existing) {
                throw new UserError("point not found", 404);
            }

            const toAdd = {
                text: "New Action",
                toPointId: "",
            };

            const { upsertedId } = await pointsCollection.updateOne(
                { _id: existing._id },
                {
                    $push: {
                        actions: toAdd,
                    },
                }
            );

            res.json({ row: toAdd });
        } catch (err) {
            next(err.message);
        }
    }
);

router.get("/", async (req: HasSessionRequest, res) => {
    const storiesCollection = await getStoriesCollection();

    const stories = await storiesCollection
        .find({ userId: req.user._id })
        .sort("createdAt", -1)
        .toArray();

    res.json({ rows: stories.map(toStoryObject) });
});

router.post("/", async (req: HasSessionRequest, res, next) => {
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
        next(err.message);
    }
});

export default router;
