const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const User = require('../models/user');

// Error handler
const errorhandler = (res, error) => {
    res.status(error.status || 500).json({ error: "Something went wrong! Please try after some time." });
};

//  Api to Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({ error: 'Name, email, password and confirmpassword are required fields.' });
        }else if(password !== confirmpassword){
            return res.status(400).json({ error: 'Password does not match' })
        }

        // Check for duplicate email
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            
        });
       
        await newUser.save();
        res.status(200).json({
            message: "user register successfully"
        });
    } catch (error) {
        errorhandler(res, error);
    }
});


// Api to login authorized User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }
        //find user by email
        const user = await User.findOne({ email });
        if (user) {
            let hasPasswordMatched = await bcrypt.compare(password, user.password);
            if (hasPasswordMatched) {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_Token, { expiresIn: '6h' })
                
                res.status(200).json({
                    token,  
                    userId:user._id,
                    message: "You have logged In successfully"
                })
            } else {
                res.status(500).json({
                    message: "Incorrect credentials"
                })
            }
        } else {
            res.status(400).json({
                message: "User does not exist"
            })
        }
    } catch (error) {
        errorhandler(res, error);
    }
});


module.exports = router;
