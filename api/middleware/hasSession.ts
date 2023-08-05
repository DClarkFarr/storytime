import { NextFunction, Request, Response } from "express";
import { getUsersCollection } from "../db/collections";
import { ObjectId } from "mongodb";

export async function hasSession(
    req: Request,
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
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}
