import { Router } from "express";
import UserError from "../errors/UserError";
import DbError from "../errors/DbError";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "Hello, world!" });
});

router.get("/bad", (req, res) => {
    throw new Error("This is a generic bad error");
});

router.get("/bad/user", (req, res) => {
    throw new UserError("Users cannot be here");
});

router.get("/bad/db", (req, res) => {
    throw new DbError("Db cannot be here");
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
