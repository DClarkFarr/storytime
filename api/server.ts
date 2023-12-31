import * as dotenv from "dotenv-flow";

dotenv.config();

import express from "express";
import { env } from "./app/Environment";
import session from "express-session";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import apiRouter from "./routers/apiRouter";
import { getClient, initializeDb } from "./db/connect";
import MongoStore from "connect-mongo";

env.applyEnv();

const app = express();

const sessConfig = {
    secret: "never stop a thing that's good",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: MongoStore.create({
        clientPromise: getClient(),
        dbName: env.MONGO_DB,
        collectionName: "sessions",
    }),
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessConfig.cookie.secure = true; // serve secure cookies
}

app.use(
    cors({
        origin: function (origin, callback) {
            // db.loadOrigins is an example call to load
            // a list of origins from a backing database
            if (app.get("env") === "production") {
                return callback(null, env.CORS_ORIGIN);
            }

            callback(null, origin);
        },
        credentials: true,
    })
);
app.use(session(sessConfig));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(path.join(__dirname, "..", "web", "dist")));
app.use(express.static(path.join(__dirname, "..", "web", "public")));

app.use("/api", apiRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "web", "dist", "index.html"));
});

initializeDb().then(() => {
    app.listen(env.PORT, () => {
        return console.log(
            `Express is listening at http://localhost:${env.PORT}`
        );
    });
});
