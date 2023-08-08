import { Router } from "express";
import { HasSessionRequest, hasSession } from "../../middleware/hasSession";
import DbError from "../../errors/DbError";
import UserError from "../../errors/UserError";
import { getScenesCollection } from "../../db/collections";
import { ObjectId } from "mongodb";
import { toSceneObject } from "../../db/scene";

const router = Router();

router.use(hasSession);

router.get("/:id", async (req: HasSessionRequest, res) => {
    const scenesCollection = await getScenesCollection();

    try {
        const scene = await scenesCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: req.user._id,
        });

        if (!scene) {
            throw new UserError("Scene not found", 404);
        }

        res.json({ row: toSceneObject(scene) });
    } catch (err) {
        if (err instanceof UserError) {
            throw err;
        }
        throw new DbError(err.message);
    }
});

/**
 * Update / save scene
 */

router.put("/:id", async (req: HasSessionRequest, res, next) => {
    const scenesCollection = await getScenesCollection();

    try {
        if (!req.body.name || typeof req.body.name !== "string") {
            throw new UserError("Invalid scene name", 400);
        } else if (req.body.name.length > 200) {
            throw new UserError("Scene name too long", 400);
        }

        if (!req.body.description || typeof req.body.description !== "string") {
            throw new UserError("Invalid scene description", 400);
        } else if (req.body.description.length > 200) {
            throw new UserError("Scene description too long", 400);
        }

        if (!req.body.elements || !Array.isArray(req.body.elements)) {
            throw new UserError("Invalid scene elements", 400);
        }

        const { value: scene } = await scenesCollection.findOneAndUpdate(
            {
                _id: new ObjectId(req.params.id),
                userId: req.user._id,
            },
            {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    elements: req.body.elements,
                },
            },
            { returnDocument: "after" }
        );

        if (!scene) {
            throw new UserError("Scene not found", 404);
        }

        res.json({ row: toSceneObject(scene) });
    } catch (err) {
        if (err instanceof UserError) {
            return next(err);
        }
        next(new DbError(err.message));
    }
});

export default router;
