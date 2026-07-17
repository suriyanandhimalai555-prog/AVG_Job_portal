import UserModel from '../models/user.model.js';

// Fetch all users for the Admin Profile List
export const getUsers = async (req, res) => {
    try {
        const users = await UserModel.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update an existing user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await UserModel.update(id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.delete(id);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Fetch individual user stats for the User Referral Dashboard
export const getUserStats = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await UserModel.getUserStats(id);
        if (!stats) {
            return res.status(404).json({ error: 'User stats not found.' });
        }
        res.status(200).json(stats);
    } catch (error) {
        console.error('Fetch Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};