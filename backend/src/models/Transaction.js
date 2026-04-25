import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    isbn: {
        type: String,
        required: true,
        ref: 'Book'
    },
    bookTitle: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['admin', 'librarian', 'faculty', 'student'],
        required: true
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Returned', 'Overdue'],
        default: 'Active'
    },
    fine: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
transactionSchema.index({ userId: 1, status: 1 });

// Auto-generate transaction ID
transactionSchema.pre('validate', async function (next) {
    if (!this.transactionId) {
        const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
            { _id: 'transactionId' },
            { $inc: { seq: 1 } },
            { upsert: true, new: true, returnDocument: 'after' }
        );
        const seq = counter.value ? counter.value.seq : counter.seq;
        this.transactionId = `TXN${String(seq).padStart(4, '0')}`;
    }
    next();
});

export default mongoose.model('Transaction', transactionSchema);
