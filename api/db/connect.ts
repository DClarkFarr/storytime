import { Db, MongoClient, ServerApiVersion } from "mongodb";

import { env } from "../app/Environment";
import { Document } from "mongodb";

let isConnected = false;

const client = new MongoClient(env.MONGO_URL, {
    // serverApi: {
    //     version: ServerApiVersion.v1,
    //     strict: false,
    //     deprecationErrors: true,
    // },
});

async function registerStoryIndexes(db: Db) {
    try {
        await db.createCollection("stories", {});
        console.log("created collection stories");
    } catch {}

    const storiesCollection = db.collection("stories");

    const storyIndexes = {
        userId: false,
    };

    const indexes = await storiesCollection.listIndexes().toArray();

    for (let index of indexes) {
        storyIndexes[index.name] = true;
    }

    if (!storyIndexes.userId) {
        await storiesCollection.createIndex({ userId: 1 }, { name: "email" });
    }
}

async function registerUserIndexes(db: Db) {
    try {
        await db.createCollection("users", {});
        console.log("created collection users");
    } catch {}
    const userCollection = db.collection("users");

    const userIndexes = {
        email: false,
    };
    const indexes = await userCollection.listIndexes().toArray();

    for (let index of indexes) {
        if (index.name === "email") {
            userIndexes.email = true;
        }
    }

    if (!userIndexes.email) {
        await userCollection.createIndex(
            { email: 1 },
            { unique: true, name: "email" }
        );
    }
}

async function registerSceneIndexes(db: Db) {
    try {
        await db.createCollection("scenes", {});
        console.log("created collection scenes");
    } catch {}

    const scenesCollection = db.collection("scenes");

    const sceneIndexes = {
        userId: false,
        storyId: false,
    };

    const indexes = await scenesCollection.listIndexes().toArray();

    for (let index of indexes) {
        sceneIndexes[index.name] = true;
    }

    if (!sceneIndexes.userId) {
        await scenesCollection.createIndex({ userId: 1 }, { name: "email" });
    }
    if (!sceneIndexes.storyId) {
        await scenesCollection.createIndex({ storyId: 1 }, { name: "storyId" });
    }
}

async function applyIndexes() {
    const db = await getDb();

    registerUserIndexes(db);
    registerStoryIndexes(db);
    registerSceneIndexes(db);
}

async function initializeDb() {
    try {
        await client.connect();

        await client.db(env.MONGO_DB).command({ ping: 1 });

        isConnected = true;

        await applyIndexes();
        console.log("Connected to database " + env.MONGO_DB);
    } finally {
    }
}

async function getDb() {
    return (await getClient()).db(env.MONGO_DB);
}

async function getClient() {
    if (!isConnected) {
        await initializeDb();
    }

    return client;
}

async function getCollection<D extends Document>(collectionName: string) {
    const db = await getDb();
    return db.collection<D>(collectionName);
}

const cleanup = async (event) => {
    // SIGINT is sent for example when you Ctrl+C a running process from the command line.
    if (isConnected) {
        console.log("closing db connection");
        await client.close(); // Close MongodDB Connection when Process ends
        isConnected = false;
    }
    process.exit(); // Exit with default success-code '0'.
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

export { getDb, getClient, initializeDb, getCollection };
