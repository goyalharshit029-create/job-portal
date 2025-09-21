import express from 'express';
import { getJobById, getJobs } from '../controllers/jobController.js';

const router = express.Router();

// GET /api/jobs/ -> Get all jobs
router.get('/', getJobs);

// GET /api/jobs/:id -> Get a single job by ID
router.get('/:id', getJobById);

export default router;
