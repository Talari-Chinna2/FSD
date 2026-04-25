import express from 'express';
import Request from '../models/Request.js';
import { auth, authorize } from '../middleware/auth.js';
import { validate, createRequestSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all requests (librarian/admin can see all, faculty see their own)
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // If not admin/librarian, only show their own requests
        if (!['admin', 'librarian'].includes(req.user.role)) {
            query.userId = req.user.userId;
        }

        if (status) {
            query.status = status;
        }

        const requests = await Request.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
            error: error.message
        });
    }
});

// Create a new request (faculty only)
router.post('/', auth, authorize('faculty'), validate(createRequestSchema), async (req, res) => {
    try {
        const { bookTitle, authorOrIsbn, courseName, reason } = req.body;

        const request = new Request({
            userId: req.user.userId,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userEmail: req.user.email,
            bookTitle,
            authorOrIsbn,
            courseName,
            reason
        });

        await request.save();

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully',
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
});

// Update request status (librarian/admin only)
router.patch('/:id/status', auth, authorize('admin', 'librarian'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        request.status = status;
        await request.save();

        res.json({
            success: true,
            message: 'Request status updated successfully',
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update request status',
            error: error.message
        });
    }
});

// Delete request (admin/librarian only)
router.delete('/:id', auth, authorize('admin', 'librarian'), async (req, res) => {
    try {
        const request = await Request.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            message: 'Request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message
        });
    }
});

export default router;
