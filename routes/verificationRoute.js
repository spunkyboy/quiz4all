const express = require('express');       // Required for creating a router
const router = express.Router();          // Create a new router instance
const User = require('../models/User');   // Import your User model


router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() } // check if token expired
    });

    if (!user) return res.status(400).send('Invalid or expired verification link');

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.send('Email verified! You can now log in.');
});

module.exports = router;
