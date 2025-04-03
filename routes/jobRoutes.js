const express = require('express');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') return res.status(403).json({ error: 'Only employers can post jobs' });

    try {
        const { title, company, description, location, salary } = req.body;
        const newJob = new Job({ title, company, description, location, salary, postedBy: req.user.userId });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post job' });
    }
});


router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'username email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});


router.post('/apply/:jobId', authenticate, async (req, res) => {
    if (req.user.role !== 'jobseeker') return res.status(403).json({ error: 'Only job seekers can apply' });

    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        job.applicants.push(req.user.userId);
        await job.save();

        res.json({ message: 'Successfully applied for the job' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to apply for the job' });
    }
});

module.exports = router;
