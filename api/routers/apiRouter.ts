import { Router } from "express";
import UserError from "../errors/UserError";
import DbError from "../errors/DbError";

import authRouter from "./apiRouter/authRouter";
import userRouter from "./apiRouter/userRouter";
import storyRouter from "./apiRouter/storyRouter";
import sceneRouter from "./apiRouter/sceneRouter";
import uploadRouter from "./apiRouter/uploadRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/story", storyRouter);
router.use("/scene", sceneRouter);
router.use("/upload", uploadRouter);

router.get("/", (req, res) => {
    res.json({ message: "Hello, world!" });
});

router.all("*", (req, res) => {
    res.status(404).json({ message: "Not found" });
});

router.use((error, request, response, next) => {
    // Error handling middleware functionality
    const status = error.status || 400;

    if (error instanceof DbError) {
        if (process.env.NODE_ENV === "production") {
            response.status(status).json({
                message: "Database error encountered. Please contact support.",
            });
            return;
        }

        response.status(status).json({
            message: error.message,
        });
        return;
    }

    if (error instanceof UserError) {
        response.status(status).json({
            message: error.message,
        });
        return;
    }

    console.log("caught uknown error", error);
    response.status(status).json({
        message: "An unknown error was encountered",
    });
});

export default router;
