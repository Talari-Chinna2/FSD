import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'librarian', 'faculty', 'student'],
        default: 'student'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });


// 🔐 Hash password
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (error) {
        next(error);
    }
});


// 🔑 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


// 🆔 Generate userId safely
userSchema.pre('save', async function (next) {
    try {
        if (this.userId) return next();

        const counter = await mongoose.connection.collection('counters').findOneAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: 'after' }
        );

        const seq =
            (counter && typeof counter.seq === 'number' && counter.seq) ||
            (counter?.value && typeof counter.value.seq === 'number' && counter.value.seq) ||
            1;

        this.userId = `USR${String(seq).padStart(3, '0')}`;

        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('User', userSchema);