import express from 'express';
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js';
import upload from '../config/multer.js';

const router = express.Router();

// GET /api/users/        -> Get user data
router.get('/', getUserData);

// POST /api/users/apply  -> Apply for a job
router.post('/apply', applyForJob);

// GET /api/users/applications -> Get applied jobs data
router.get('/applications', getUserJobApplications);

// POST /api/users/update-resume -> Update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume);

export default router;
