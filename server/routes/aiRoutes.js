import express from 'express';
import { detectAI } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/detect
router.post('/detect', detectAI);

export default router; //
