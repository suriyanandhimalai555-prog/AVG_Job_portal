import BusinessModel from '../../models/admin/business.model.js';

export const getBusinesses = async (req, res) => {
    try {
        const businesses = await BusinessModel.getAll();
        res.status(200).json(businesses);
    } catch (error) {
        console.error('Fetch Businesses Error:', error);
        res.status(500).json({ error: 'Failed to fetch businesses' });
    }
};

export const createBusiness = async (req, res) => {
    try {
        const { name, category, location } = req.body;
        if (!name || !category || !location) {
            return res.status(400).json({ error: 'Name, Category, and Location are required.' });
        }

        const newBusiness = await BusinessModel.create(req.body);
        res.status(201).json(newBusiness);
    } catch (error) {
        console.error('Create Business Error:', error);
        res.status(500).json({ error: 'Failed to create business' });
    }
};

export const updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBusiness = await BusinessModel.update(id, req.body);
        if (!updatedBusiness) {
            return res.status(404).json({ error: 'Business not found.' });
        }
        res.status(200).json(updatedBusiness);
    } catch (error) {
        console.error('Update Business Error:', error);
        res.status(500).json({ error: 'Failed to update business' });
    }
};

export const deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        await BusinessModel.delete(id);
        res.status(200).json({ message: 'Business deleted successfully.' });
    } catch (error) {
        console.error('Delete Business Error:', error);
        res.status(500).json({ error: 'Failed to delete business' });
    }
};