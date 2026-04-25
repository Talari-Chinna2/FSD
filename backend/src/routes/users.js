import express from 'express';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import { validate, registerUserSchema, updateUserSchema } from '../middleware/validation.js';

const router = express.Router();

const sanitizeUser = (user) => ({
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

// Get all users (admin/librarian only)
router.get('/', auth, authorize('admin', 'librarian'), async (req, res) => {
    try {
        const { search, role, status } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (status) {
            query.status = status;
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users.map(sanitizeUser)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

// Create user
router.post('/', auth, authorize('admin'), validate(registerUserSchema), async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, role, status } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            username,
            password,
            role,
            status: status || 'Active'
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
});

// Update user
router.put('/:id', auth, authorize('admin'), validate(updateUserSchema), async (req, res) => {
    try {
        const { firstName, lastName, email, role, status } = req.body;

        const user = await User.findOne({ userId: req.params.id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for duplicate email/username if being changed
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, userId: { $ne: req.params.id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        // Update user fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.role = role || user.role;
        user.status = status || user.status;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// Delete user
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findOneAndDelete({ userId: req.params.id });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

export default router;
