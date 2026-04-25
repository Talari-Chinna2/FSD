import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

// Validate that availableQuantity doesn't exceed totalQuantity
bookSchema.pre('save', function (next) {
    if (this.availableQuantity > this.totalQuantity) {
        this.availableQuantity = this.totalQuantity;
    }
    next();
});

export default mongoose.model('Book', bookSchema);
