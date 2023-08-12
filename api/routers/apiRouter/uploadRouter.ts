import { Router } from "express";

import { HasSessionRequest, hasSession } from "../../middleware/hasSession";

import multer from "multer";

import { v4 as uuid } from "uuid";
import { getUploadsCollection } from "../../db/collections";
import { UploadDocumentSchema } from "../../types/Upload";
import { toUploadObject } from "../../db/upload";
import { beforeSaveToDirectory } from "../../util/file";

const router = Router();

router.use(hasSession);

const storage = multer.diskStorage({
    destination: function (req: HasSessionRequest, file, cb) {
        beforeSaveToDirectory(`../web/public/uploads/user-${req.user._id}`);
        cb(null, `../web/public/uploads/user-${req.user._id}`);
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split(".").pop();

        if (!["jpg", "png"].includes(extension)) {
            return cb(new Error("Invalid file type"), file.filename);
        }
        cb(null, `${uuid()}.${extension}`);
    },
});

const upload = multer({ storage }).single("file");

router.post("/file", upload, async (req: HasSessionRequest, res, next) => {
    const uploadsCollection = await getUploadsCollection();

    try {
        const toInsert: UploadDocumentSchema = {
            alt: req.body.alt || "",
            name: req.body.name || req.file.originalname || "",
            userId: req.user._id,
            src: req.file.path.replace("../web/public", ""),
            createdAt: new Date(),
        };

        const { insertedId } = await uploadsCollection.insertOne(toInsert);

        const upload = await uploadsCollection.findOne({ _id: insertedId });

        if (!upload) {
            throw new Error("Error saving file");
        }

        res.json({ row: toUploadObject(upload) });
    } catch (err) {
        next(err);
    }
});

export default router;
