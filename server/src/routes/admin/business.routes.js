import express from 'express';
import { 
    getBusinesses, 
    createBusiness, 
    updateBusiness, 
    deleteBusiness 
} from '../../controllers/admin/business.controller.js';

const router = express.Router();

router.get('/', getBusinesses);
router.post('/', createBusiness);
router.put('/:id', updateBusiness);
router.delete('/:id', deleteBusiness);

export default router;