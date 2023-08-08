import { Router } from "express";
import { getUsersCollection } from "../../db/collections";
import UserError from "../../errors/UserError";
import DbError from "../../errors/DbError";
import { checkPassword, createPassword } from "../../db/password";
import { toUserObject } from "../../db/user";

const router = Router();

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    const userCollection = await getUsersCollection();

    const user = await userCollection.findOne({ email: email });

    if (!user) {
        return next(new UserError("User not found"));
    }

    if (!checkPassword(password, user.password)) {
        return next(new UserError("Incorrect password"));
    }

    req.session.userId = user._id.toString();

    res.json({ user: toUserObject(user) });
});

router.post("/register", async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        next(new UserError("missing email or password"));
    }

    if (!firstName || !lastName) {
        next(new UserError("missing first or last name"));
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

        req.session.userId = user._id.toString();

        res.json({ user: toUserObject(user) });
    } catch (err) {
        if (err.message.includes("duplicate key error")) {
            next(new UserError("Email already exists"));
        } else {
            next(new DbError(err.message));
        }
    }
});

router.post("/logout", (req, res) => {
    req.session.regenerate((err) => {
        console.log("error logging out", err);
    });

    res.json({ logout: true });
});

export default router;
