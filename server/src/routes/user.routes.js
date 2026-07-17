import express from 'express';
import { 
    getUsers, 
    updateUser, 
    deleteUser,
    getUserStats // 👈 Import new function
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id/stats', getUserStats); // 👈 Mount new route
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;