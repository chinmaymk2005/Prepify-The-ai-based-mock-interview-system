const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken')


// User Signup Controller 
exports.signup = async (req, res) => {
    try {
        const { name, email, password, targetRole, experienceLevel } = req.body;        
        
        // 1. Basic validation
        if (!name || !email || !password || !targetRole || !experienceLevel) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // 3. Create user (password hashing handled by model)
        const user = await User.create({
            name,
            email,
            password,
            targetRole,
            experienceLevel
        });

        const token = generateToken(user._id);
        console.log('New User Registered:', user);
        // 4. Response (never send password)  

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                targetRole: user.targetRole,
                experienceLevel: user.experienceLevel
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// User Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 2. Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        console.log('User Logged In:', user);
        // 4. Successful login response
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,   
                name: user.name,
                email: user.email,
                targetRole: user.targetRole,
                experienceLevel: user.experienceLevel
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}