import express from 'express';
import { createPost, getPosts, toggleLike, addComment, sharePost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/', createPost);
router.get('/', getPosts);
router.post('/:postId/like', toggleLike);
router.post('/:postId/comment', addComment);
router.post('/:postId/share', sharePost);

export default router;