import { Router } from "express";
import { getUsersCollection } from "../../db/collections";
import UserError from "../../errors/UserError";
import DbError from "../../errors/DbError";
import { createPassword } from "../../db/password";

const router = Router();

router.post("/login", async (req, res) => {});

router.post("/register", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        throw new UserError("missing email or password");
    }

    if (!firstName || !lastName) {
        throw new UserError("missing first or last name");
    }

    const userCollection = await getUsersCollection();

    try {
        const { insertedId } = await userCollection.insertOne({
            email,
            password: createPassword(password),
            firstName,
            lastName,
            createdAt: new Date(),
        });

        const user = await userCollection.findOne({ _id: insertedId });

        res.json({ user });
    } catch (err) {
        throw new DbError(err.message);
    }
});

router.post("/logout", (req, res) => {
    req.session.regenerate((err) => {
        console.log("error logging out", err);
    });

    res.json({ logout: true });
});

export default router;
