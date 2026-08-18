import express from 'express';
import {
    getUsers, updateUser, deleteUser, getUserStats, toggleFollowUser, getFollowData
} from '../../controllers/user/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id/stats', getUserStats);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/follow', toggleFollowUser);
router.get('/:id/follow-stats', getFollowData);

export default router;