import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import { validate, issueBookSchema, reserveBookSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all transactions (role-based filtering)
router.get('/', auth, async (req, res) => {
    try {
        const { search, status, userId } = req.query;

        let query = {};

        // Non-admin/librarian users can only see their own transactions
        if (!['admin', 'librarian'].includes(req.user.role)) {
            query.userId = req.user.userId;
        } else if (userId) {
            // Admin/librarian can filter by specific user
            query.userId = userId;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { bookTitle: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

// Issue book to user (with transaction support and student limit enforcement)
router.post('/issue', auth, authorize('admin', 'librarian'), validate(issueBookSchema), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, isbn, dueDate } = req.body;

        // Find user
        const user = await User.findOne({ userId }).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Enforce student borrow limit (max 3 books)
        if (user.role === 'student') {
            const activeBorrows = await Transaction.countDocuments({
                userId,
                status: 'Active'
            }).session(session);

            if (activeBorrows >= 3) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Student borrowing limit reached (max 3 books)'
                });
            }
        }

        // Find book
        const book = await Book.findOne({ isbn }).session(session);
        if (!book) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check availability
        if (book.availableQuantity <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Book is not available for issue'
            });
        }

        // Check if user already has this book
        const existingTransaction = await Transaction.findOne({
            userId,
            isbn,
            status: 'Active'
        }).session(session);

        if (existingTransaction) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'User already has this book issued'
            });
        }

        // Create transaction
        const transaction = new Transaction({
            userId,
            isbn,
            bookTitle: book.title,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role,
            dueDate: new Date(dueDate)
        });

        await transaction.save({ session });

        // Update book availability
        book.availableQuantity -= 1;
        await book.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Failed to issue book',
            error: error.message
        });
    }
});

// Return book (with transaction support)
router.post('/return/:transactionId', auth, authorize('admin', 'librarian'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.findOne({
            transactionId: req.params.transactionId
        }).session(session);

        if (!transaction) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status === 'Returned') {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Book already returned'
            });
        }

        // Calculate fine if overdue
        const now = new Date();
        const dueDate = new Date(transaction.dueDate);
        let fine = 0;

        if (now > dueDate) {
            const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
            fine = daysLate * 2; // ₹2 per day
        }

        transaction.status = 'Returned';
        transaction.returnDate = now;
        transaction.fine = fine;
        await transaction.save({ session });

        // Update book availability
        const book = await Book.findOne({ isbn: transaction.isbn }).session(session);
        if (book) {
            book.availableQuantity += 1;
            await book.save({ session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Book returned successfully',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Failed to return book',
            error: error.message
        });
    }
});

// Get dashboard statistics
router.get('/stats/dashboard', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        let stats = {};

        if (userRole === 'admin' || userRole === 'librarian') {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ status: 'Active' });
            const totalBooks = await Book.aggregate([
                { $group: { _id: null, total: { $sum: '$totalQuantity' }, available: { $sum: '$availableQuantity' } } }
            ]);
            const activeIssues = await Transaction.countDocuments({ status: 'Active' });
            const overdue = await Transaction.countDocuments({
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            stats = {
                totalUsers,
                activeUsers,
                totalBooks: totalBooks[0]?.total || 0,
                availableBooks: totalBooks[0]?.available || 0,
                activeIssues,
                overdue
            };
        } else {
            // For faculty and students
            const borrowedCount = await Transaction.countDocuments({
                userId,
                status: 'Active'
            });
            const overdueCount = await Transaction.countDocuments({
                userId,
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            // Calculate fine
            const overdueTransactions = await Transaction.find({
                userId,
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            let totalFine = 0;
            overdueTransactions.forEach(t => {
                const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                totalFine += daysLate * 2;
            });

            stats = {
                borrowedCount,
                overdueCount,
                totalFine
            };
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message
        });
    }
});

// Get user's transactions
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const requestedUserId = req.params.userId;

        if (!['admin', 'librarian'].includes(req.user.role) && requestedUserId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        let query = { userId: requestedUserId };

        if (status) {
            query.status = status;
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user transactions',
            error: error.message
        });
    }
});

// Reserve book (for faculty - with transaction support)
router.post('/reserve', auth, authorize('faculty'), validate(reserveBookSchema), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { isbn, dueDate } = req.body;

        // Check if faculty already has this book
        const existingTransaction = await Transaction.findOne({
            userId: req.user.userId,
            isbn,
            status: 'Active'
        }).session(session);

        if (existingTransaction) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'You already have this book issued'
            });
        }

        const book = await Book.findOne({ isbn }).session(session);
        if (!book) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (book.availableQuantity <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Book is not available for reservation'
            });
        }

        // Faculty can borrow for up to 30 days
        const dueDateObj = new Date(dueDate);
        const issueDate = new Date();
        const maxDays = 30;
        const daysDiff = Math.ceil((dueDateObj - issueDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > maxDays) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Faculty can borrow for maximum ${maxDays} days`
            });
        }

        const transaction = new Transaction({
            userId: req.user.userId,
            isbn,
            bookTitle: book.title,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userRole: req.user.role,
            dueDate: dueDateObj
        });

        await transaction.save({ session });

        book.availableQuantity -= 1;
        await book.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Book reserved successfully',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Failed to reserve book',
            error: error.message
        });
    }
});

export default router;
