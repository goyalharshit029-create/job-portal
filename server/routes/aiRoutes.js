import express from "express";
import { detectAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/detect-ai", detectAI);

export default router;
