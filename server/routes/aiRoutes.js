import express from 'express';
import { detectAI } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/detect-ai
router.post('/detect-ai', detectAI);

export default router;
