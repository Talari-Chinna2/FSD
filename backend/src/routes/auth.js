import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validate, loginSchema, registerUserSchema } from '../middleware/validation.js';

const router = express.Router();

// 🔐 LOGIN
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        // ❗ Check JWT secret
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not defined in .env');
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            }
        });

    } catch (error) {
        console.error('🔥 Login Error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// 📝 REGISTER
router.post('/register', validate(registerUserSchema), async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, role, status } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        let user = null;
        let saved = false;

        // Retry only if a generated userId collides; username/email collisions are handled above.
        for (let attempt = 0; attempt < 3; attempt++) {
            user = new User({
                firstName,
                lastName,
                email,
                username,
                password,
                role,
                status: status || 'Active'
            });

            try {
                await user.save();
                saved = true;
                break;
            } catch (saveError) {
                if (saveError?.code === 11000 && saveError?.keyPattern?.userId) {
                    continue;
                }
                throw saveError;
            }
        }

        if (!saved || !user) {
            return res.status(500).json({
                success: false,
                message: 'Could not generate a unique user ID. Please try again.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('🔥 Register Error:', error.message);

        if (error?.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;