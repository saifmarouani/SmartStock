const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// POST api/auth/register
router.post('/register', async (req, res) => {
    console.log("👉 SERVER: Register Request Recieved:", req.body);
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log("✅ SERVER: User Saved to DB!");

        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret_token_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error("❌ Server Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST api/auth/login
router.post('/login', async (req, res) => {
    console.log("👉 SERVER: Login Request Recieved:", req.body);
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret_token_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, userId: user.id, userName: user.name });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;