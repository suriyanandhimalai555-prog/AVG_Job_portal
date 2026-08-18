import express from 'express';
import {
    getUsers, getUserById, updateUser, deleteUser, getUserStats, toggleFollowUser, getFollowData, proxyImage
} from '../../controllers/user/user.controller.js';

const router = express.Router();

// MUST BE FIRST to avoid treating 'proxy-image' as an ID parameter
router.get('/proxy-image', proxyImage);

router.get('/', getUsers);
router.get('/:id/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/follow', toggleFollowUser);
router.get('/:id/follow-stats', getFollowData);

export default router;