import express from 'express';
import { 
    getJobs, 
    createJob, 
    updateJob, 
    deleteJob 
} from '../../controllers/admin/job.controller.js';

const router = express.Router();

router.get('/', getJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;