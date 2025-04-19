import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

// Register Route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, username }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, username });
    } catch (err) {
        res.status(500).json({ msg: 'Something went wrong', error: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, username });
    } catch (err) {
        res.status(500).json({ msg: 'Something went wrong', error: err.message });
    }
});

export default router;