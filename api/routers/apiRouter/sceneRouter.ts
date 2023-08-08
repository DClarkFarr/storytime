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

export default router;
