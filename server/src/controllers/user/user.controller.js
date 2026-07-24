import UserModel from '../../models/user/user.model.js';
import { uploadBase64ToS3 } from '../../config/s3.js';

export const getUsers = async (req, res) => {
    try {
        const users = await UserModel.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        // If a new base64 profile picture string is supplied, upload it to S3
        if (updateData.profile_picture && updateData.profile_picture.startsWith('data:image/')) {
            const imageUrl = await uploadBase64ToS3(updateData.profile_picture);
            updateData.profile_picture = imageUrl;
        }

        const updatedUser = await UserModel.update(id, updateData);
        if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.delete(id);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await UserModel.getUserStats(id);
        if (!stats) return res.status(404).json({ error: 'User stats not found.' });
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

export const toggleFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { followerId } = req.body;
        if (!followerId) return res.status(400).json({ error: "Follower ID required" });

        const result = await UserModel.toggleFollow(followerId, id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFollowData = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await UserModel.getFollowStats(id);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};