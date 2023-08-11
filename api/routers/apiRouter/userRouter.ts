import { Router } from "express";
import { getUploadsCollection, getUsersCollection } from "../../db/collections";
import { HasSessionRequest, hasSession } from "../../middleware/hasSession";
import { ObjectId } from "mongodb";
import { toUserObject } from "../../db/user";
import { toUploadObject } from "../../db/upload";

const router = Router();

router.get("/", hasSession, async (req, res) => {
    const userCollection = await getUsersCollection();

    const user = await userCollection.findOne({
        _id: new ObjectId(req.session.userId),
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: toUserObject(user) });
});

router.get("/images", hasSession, async (req: HasSessionRequest, res, next) => {
    const uploadsCollection = await getUploadsCollection();

    try {
        const uploads = await uploadsCollection
            .find({
                userId: req.user._id,
            })
            .sort("createdAt", -1)
            .toArray();

        res.json({ rows: uploads.map(toUploadObject) });
    } catch (err) {
        next(err);
    }
});

export default router;
