import { Router } from "express";
import UserError from "../errors/UserError";
import DbError from "../errors/DbError";

import authRouter from "./apiRouter/auth";

const router = Router();

router.use("/auth", authRouter);

router.get("/", (req, res) => {
    res.json({ message: "Hello, world!" });
});

router.all("*", (req, res) => {
    res.status(404).json({ message: "Not found" });
});

router.use((error, request, response, next) => {
    // Error handling middleware functionality
    console.log(`Caught error ${error.message}`); // log the error
    const status = error.status || 400;

    if (error instanceof DbError) {
        if (process.env.NODE_ENV === "production") {
            return response.status(status).json({
                message: "Database error encountered. Please contact support.",
            });
        }

        return response.status(status).json({
            message: error.message,
        });
    }

    if (error instanceof UserError) {
        return response.status(status).json({
            message: error.message,
        });
    }
    response.status(status).json({
        message: "An unknown error was encountered",
    });
});

export default router;
