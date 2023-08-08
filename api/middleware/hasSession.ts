import { NextFunction, Request, Response } from "express";
import { getUsersCollection } from "../db/collections";
import { UserDocument } from "../types/User";
import { ObjectId } from "mongodb";

export type HasSessionRequest = Request & { user: UserDocument };

export async function hasSession(
    req: HasSessionRequest,
    res: Response,
    next: NextFunction
) {
    if (req.session.userId) {
        const collection = await getUsersCollection();

        const user = await collection.findOne({
            _id: new ObjectId(req.session.userId),
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user;

        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}
