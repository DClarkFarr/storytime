import * as dotenv from "dotenv-flow";

dotenv.config();

import express from "express";
import { env } from "./app/Environment";
import session from "express-session";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import apiRouter from "./routers/apiRouter";

env.applyEnv();

const app = express();

const sessConfig = {
    secret: "never stop a thing that's good",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessConfig.cookie.secure = true; // serve secure cookies
}

app.use(cors());
app.use(session(sessConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "web", "dist")));

app.use("/api", apiRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "web", "dist", "index.html"));
});

app.listen(env.PORT, () => {
    return console.log(`Express is listening at http://localhost:${env.PORT}`);
});
