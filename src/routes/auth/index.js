import express from "express";
import localAuth from "./localAuth.js";
import googleAuth from "./googleAuth.js";

const router = express.Router();

router.use("/", localAuth);
router.use("/", googleAuth);

export default router;
