import CourseModel from '../models/course.model.js';

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
        const { title, category, price, status } = req.body;
        if (!title || !category || !price) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newCourse = await CourseModel.create(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Create Course Error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCourse = await CourseModel.update(id, req.body);
        if (!updatedCourse) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('Update Course Error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await CourseModel.delete(id);
        res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (error) {
        console.error('Delete Course Error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};