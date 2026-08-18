import UserModel from '../../models/user/user.model.js';
import { uploadBase64ToS3 } from '../../config/s3.js';

// --- NEW PROXY TO FIX S3 CORS ISSUE ---
export const proxyImage = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Return image with open CORS headers
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(buffer);
    } catch (error) {
        console.error('Proxy Image Error:', error);
        res.status(500).json({ error: 'Failed to proxy image' });
    }
};

export const getUsers = async (req, res) => {
    try {
        // Prevent any reverse proxy / CDN in front of the live API from serving a
        // stale cached copy of this list after a profile update.
        res.set('Cache-Control', 'no-store');
        const users = await UserModel.getAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const user = await UserModel.getById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Fetch User Error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        // If a new base64 profile picture string is supplied, upload it to S3.
        // This is isolated in its own try/catch so an S3 failure returns a clear
        // error instead of silently proceeding and letting the rest of the
        // payload overwrite the user's saved profile with an unresolved image.
        if (updateData.profile_picture && updateData.profile_picture.startsWith('data:image/')) {
            try {
                updateData.profile_picture = await uploadBase64ToS3(updateData.profile_picture);
            } catch (uploadError) {
                console.error('S3 Upload Error:', uploadError);
                return res.status(502).json({ error: 'Failed to upload profile picture. Please try again.' });
            }
        }

        // Debug aid: log exactly which fields this request is writing, so a
        // request that unexpectedly wipes fields (e.g. an avatar-only save that
        // accidentally includes blank values for other columns) is visible in
        // the production logs instead of silently persisting.
        console.log(`[updateUser] id=${id} fields=${Object.keys(updateData).join(',')}`);

        const updatedUser = await UserModel.update(id, updateData);
        if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update User Error:', error);
        if (error.code === '23502') {
            // not_null_violation
            return res.status(422).json({ error: `This account is missing a required field (${error.column || 'unknown'}) and couldn't be saved.` });
        }
        if (error.code === '23505') {
            // unique_violation (e.g. email already taken by another account)
            return res.status(409).json({ error: 'That email is already in use by another account.' });
        }
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