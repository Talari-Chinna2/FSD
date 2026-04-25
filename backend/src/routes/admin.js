import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import Request from '../models/Request.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Backup database (export all data as JSON)
router.post('/backup', auth, authorize('admin'), async (req, res) => {
    try {
        const backup = {
            timestamp: new Date(),
            users: await User.find({}),
            books: await Book.find({}),
            transactions: await Transaction.find({}),
            requests: await Request.find({})
        };

        res.json({
            success: true,
            message: 'Database backup created successfully',
            data: backup
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Backup failed',
            error: error.message 
        });
    }
});

// Restore database (import from JSON)
router.post('/restore', auth, authorize('admin'), async (req, res) => {
    try {
        const { backupData } = req.body;

        if (!backupData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Backup data is required' 
            });
        }

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});
        await Transaction.deleteMany({});
        await Request.deleteMany({});

        // Restore data
        if (backupData.users?.length) await User.insertMany(backupData.users);
        if (backupData.books?.length) await Book.insertMany(backupData.books);
        if (backupData.transactions?.length) await Transaction.insertMany(backupData.transactions);
        if (backupData.requests?.length) await Request.insertMany(backupData.requests);

        res.json({
            success: true,
            message: 'Database restored successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Restore failed',
            error: error.message 
        });
    }
});

// Get comprehensive dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role === 'admin') {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ status: 'Active' });
            const inactiveUsers = await User.countDocuments({ status: 'Inactive' });
            
            const usersByRole = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            const totalBooks = await Book.countDocuments();
            const totalBookQuantity = await Book.aggregate([
                { $group: { _id: null, total: { $sum: '$totalQuantity' }, available: { $sum: '$availableQuantity' } } }
            ]);

            const totalTransactions = await Transaction.countDocuments();
            const activeIssues = await Transaction.countDocuments({ status: 'Active' });
            const returnedBooks = await Transaction.countDocuments({ status: 'Returned' });
            const overdueBooks = await Transaction.countDocuments({ 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const pendingRequests = await Request.countDocuments({ status: 'Pending' });
            const approvedRequests = await Request.countDocuments({ status: 'Approved' });
            const rejectedRequests = await Request.countDocuments({ status: 'Rejected' });

            // Recent activity
            const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
            const recentTransactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(10);
            const recentRequests = await Request.find({}).sort({ createdAt: -1 }).limit(5);

            res.json({
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        inactive: inactiveUsers,
                        byRole: usersByRole
                    },
                    books: {
                        total: totalBooks,
                        totalQuantity: totalBookQuantity[0]?.total || 0,
                        availableQuantity: totalBookQuantity[0]?.available || 0
                    },
                    transactions: {
                        total: totalTransactions,
                        active: activeIssues,
                        returned: returnedBooks,
                        overdue: overdueBooks
                    },
                    requests: {
                        total: pendingRequests + approvedRequests + rejectedRequests,
                        pending: pendingRequests,
                        approved: approvedRequests,
                        rejected: rejectedRequests
                    },
                    recent: {
                        users: recentUsers,
                        transactions: recentTransactions,
                        requests: recentRequests
                    }
                }
            });
        } else if (role === 'librarian') {
            const totalBooks = await Book.countDocuments();
            const totalBookQuantity = await Book.aggregate([
                { $group: { _id: null, total: { $sum: '$totalQuantity' }, available: { $sum: '$availableQuantity' } } }
            ]);

            const activeIssues = await Transaction.countDocuments({ status: 'Active' });
            const overdueBooks = await Transaction.countDocuments({ 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const pendingRequests = await Request.countDocuments({ status: 'Pending' });

            const todayReturns = await Transaction.countDocuments({
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const recentTransactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(10);
            const lowStockBooks = await Book.find({ 
                availableQuantity: { $lt: 2 } 
            }).sort({ availableQuantity: 1 }).limit(10);

            res.json({
                success: true,
                data: {
                    books: {
                        total: totalBooks,
                        totalQuantity: totalBookQuantity[0]?.total || 0,
                        availableQuantity: totalBookQuantity[0]?.available || 0
                    },
                    transactions: {
                        active: activeIssues,
                        overdue: overdueBooks,
                        todayReturns
                    },
                    requests: {
                        pending: pendingRequests
                    },
                    recent: {
                        transactions: recentTransactions,
                        lowStockBooks
                    }
                }
            });
        } else if (role === 'faculty') {
            const userId = req.user.userId;
            
            const borrowedCount = await Transaction.countDocuments({ 
                userId, 
                status: 'Active' 
            });
            
            const overdueCount = await Transaction.countDocuments({ 
                userId, 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const myRequests = await Request.countDocuments({ userId });
            const pendingRequests = await Request.countDocuments({ 
                userId, 
                status: 'Pending' 
            });

            const myTransactions = await Transaction.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10);

            const reservedBooks = await Transaction.find({ 
                userId, 
                status: 'Active' 
            });

            // Calculate fine
            let totalFine = 0;
            const overdueTransactions = await Transaction.find({ 
                userId, 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            overdueTransactions.forEach(t => {
                const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                totalFine += daysLate * 2;
            });

            res.json({
                success: true,
                data: {
                    borrowed: borrowedCount,
                    overdue: overdueCount,
                    requests: {
                        total: myRequests,
                        pending: pendingRequests
                    },
                    fine: totalFine,
                    transactions: myTransactions,
                    reserved: reservedBooks
                }
            });
        } else if (role === 'student') {
            const userId = req.user.userId;
            
            const borrowedCount = await Transaction.countDocuments({ 
                userId, 
                status: 'Active' 
            });
            
            const overdueCount = await Transaction.countDocuments({ 
                userId, 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const myTransactions = await Transaction.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10);

            // Calculate fine
            let totalFine = 0;
            const overdueTransactions = await Transaction.find({ 
                userId, 
                status: 'Active',
                dueDate: { $lt: new Date() }
            });

            const notifications = [];

            overdueTransactions.forEach(t => {
                const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                const fine = daysLate * 2;
                totalFine += fine;
                
                notifications.push({
                    type: 'overdue',
                    message: `"${t.bookTitle}" is ${daysLate} days overdue. Fine: ₹${fine}`,
                    severity: 'high'
                });
            });

            // Check for books due in next 2 days
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

            const dueSoon = await Transaction.find({
                userId,
                status: 'Active',
                dueDate: { $gte: new Date(), $lte: twoDaysFromNow }
            });

            dueSoon.forEach(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                notifications.push({
                    type: 'due_soon',
                    message: `"${t.bookTitle}" is due in ${daysLeft} day(s)`,
                    severity: 'medium'
                });
            });

            res.json({
                success: true,
                data: {
                    borrowed: borrowedCount,
                    overdue: overdueCount,
                    fine: totalFine,
                    transactions: myTransactions,
                    notifications,
                    maxBorrowLimit: 3,
                    canBorrowMore: borrowedCount < 3
                }
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch dashboard data',
            error: error.message 
        });
    }
});

// Get notifications for user
router.get('/notifications', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = [];

        const overdueTransactions = await Transaction.find({ 
            userId, 
            status: 'Active',
            dueDate: { $lt: new Date() }
        });

        overdueTransactions.forEach(t => {
            const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
            const fine = daysLate * 2;
            
            notifications.push({
                id: t._id,
                type: 'overdue',
                title: 'Overdue Book',
                message: `"${t.bookTitle}" is ${daysLate} days overdue. Fine: ₹${fine}`,
                severity: 'high',
                date: t.dueDate
            });
        });

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        const dueSoon = await Transaction.find({
            userId,
            status: 'Active',
            dueDate: { $gte: new Date(), $lte: twoDaysFromNow }
        });

        dueSoon.forEach(t => {
            const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            notifications.push({
                id: t._id,
                type: 'due_soon',
                title: 'Due Soon',
                message: `"${t.bookTitle}" is due in ${daysLeft} day(s)`,
                severity: 'medium',
                date: t.dueDate
            });
        });

        res.json({
            success: true,
            count: notifications.length,
            data: notifications.sort((a, b) => {
                const severityOrder = { high: 0, medium: 1, low: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            })
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch notifications',
            error: error.message 
        });
    }
});

export default router;
