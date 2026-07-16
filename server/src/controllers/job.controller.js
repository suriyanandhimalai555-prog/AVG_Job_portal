import JobModel from '../models/job.model.js';

export const getJobs = async (req, res) => {
    try {
        const jobs = await JobModel.getAll();
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

export const createJob = async (req, res) => {
    try {
        const { title, company, type, status } = req.body;
        if (!title || !company || !type) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newJob = await JobModel.create(req.body);
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Create Job Error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedJob = await JobModel.update(id, req.body);
        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Update Job Error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await JobModel.delete(id);
        res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
        console.error('Delete Job Error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
};