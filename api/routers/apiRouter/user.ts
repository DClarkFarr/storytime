import { Router } from "express";
import { getUsersCollection } from "../../db/collections";
import { hasSession } from "../../middleware/hasSession";
import { ObjectId } from "mongodb";
import { toUserObject } from "../../db/user";

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

export default router;
