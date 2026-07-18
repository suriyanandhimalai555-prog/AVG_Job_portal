import express from 'express';
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getUserEnrollments,
    enrollInCourse,
    getUserWishlist,
    toggleCourseWishlist
} from '../controllers/course.controller.js';

const router = express.Router();

// User Data Routes (Place before /:id routes to avoid parameter conflicts)
router.get('/user/enrollments', getUserEnrollments);
router.get('/user/wishlist', getUserWishlist);

// Core CRUD Routes
router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Actions Routes
router.post('/:id/enroll', enrollInCourse);
router.post('/:id/wishlist', toggleCourseWishlist);

export default router;