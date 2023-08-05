import { MongoClient, ServerApiVersion } from "mongodb";

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

async function applyIndexes() {
    const db = await getDb();
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
