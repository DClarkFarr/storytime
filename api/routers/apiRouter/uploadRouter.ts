import { Router } from "express";

import { HasSessionRequest, hasSession } from "../../middleware/hasSession";

const router = Router();

router.use(hasSession);

router.post("/", async (req: HasSessionRequest, res) => {});

export default router;
