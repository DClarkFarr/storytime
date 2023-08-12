import { Router } from "express";
import { HasSessionRequest, hasSession } from "../../middleware/hasSession";
import DbError from "../../errors/DbError";
import UserError from "../../errors/UserError";
import { getScenesCollection } from "../../db/collections";
import { ObjectId } from "mongodb";
import { toSceneObject } from "../../db/scene";
import fs from "fs";
import { beforeSaveToDirectory } from "../../util/file";

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
        if (req.body.name) {
            if (typeof req.body.name !== "string") {
                throw new UserError("Invalid scene name", 400);
            } else if (req.body.name.length > 200) {
                throw new UserError("Scene name too long", 400);
            }
        }

        if (req.body.description && typeof req.body.description !== "string") {
            throw new UserError("Invalid scene description", 400);
        }

        if (req.body.elements && !Array.isArray(req.body.elements)) {
            throw new UserError("Invalid scene elements", 400);
        }

        if (req.body.imageData && typeof req.body.imageData !== "string") {
            throw new UserError("Invalid scene image data", 400);
        }

        const existing = await scenesCollection.findOne({
            _id: new ObjectId(req.params.id),
        });

        const toSet: Partial<{
            name: string;
            description: string;
            elements: object[];
            image: string;
        }> = {};
        ["name", "description", "elements"].forEach((key) => {
            if (req.body[key]) {
                toSet[key] = req.body[key] || existing[key];
            }
        });

        if (!existing) {
            throw new UserError("Scene not found", 404);
        }

        if (req.body.imageData) {
            var base64Data = req.body.imageData.replace(
                /^data:image\/png;base64,/,
                ""
            );

            try {
                const filename = `/uploads/scene-thumbnails/${existing._id}.jpg`;
                beforeSaveToDirectory(`../web/public${filename}`);

                fs.writeFileSync(
                    `../web/public${filename}`,
                    base64Data,
                    "base64"
                );

                const url = new URL(existing.image, "https://base.com");
                let v = 1;
                if (url.searchParams.has("v")) {
                    v = parseInt(url.searchParams.get("v")) + 1;
                }
                toSet.image = `${filename}?v=${v}`;
            } catch (err) {
                console.log("error saving scene thumbnail", err);
            }
        }

        const { value: scene } = await scenesCollection.findOneAndUpdate(
            {
                _id: new ObjectId(req.params.id),
                userId: req.user._id,
            },
            {
                $set: toSet,
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
