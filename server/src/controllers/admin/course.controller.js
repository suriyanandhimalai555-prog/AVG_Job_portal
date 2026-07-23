import CourseModel from '../../models/admin/course.model.js';

export const getCourses = async (req, res) => {
    try {
        const courses = await CourseModel.getAll();
        res.status(200).json(courses);
    } catch (error) {
        console.error('Fetch Courses Error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { title, category, price } = req.body;
        if (!title || !category || !price) {
            return res.status(400).json({ error: 'Title, Category, and Base Price are required.' });
        }
        const newCourse = await CourseModel.create(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCourse = await CourseModel.update(id, req.body);
        if (!updatedCourse) return res.status(404).json({ error: 'Course target instance missing.' });
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await CourseModel.delete(id);
        res.status(200).json({ message: 'Course record removed cleanly.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

// --- NEW: User Interaction Controllers ---

export const getUserEnrollments = async (req, res) => {
    try {
        const { userId } = req.query; // Passed from frontend
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const enrollments = await CourseModel.getEnrollments(userId);
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

export const enrollInCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        await CourseModel.enrollUser(userId, id);
        res.status(200).json({ message: 'Successfully enrolled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
};

export const getUserWishlist = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const wishlist = await CourseModel.getWishlist(userId);
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

export const toggleCourseWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const result = await CourseModel.toggleWishlist(userId, id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle wishlist' });
    }
};