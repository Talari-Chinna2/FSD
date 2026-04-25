import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    bookTitle: {
        type: String,
        required: true,
        trim: true
    },
    authorOrIsbn: {
        type: String,
        required: true,
        trim: true
    },
    courseName: {
        type: String,
        trim: true
    },
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Index for better query performance
requestSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Request', requestSchema);
