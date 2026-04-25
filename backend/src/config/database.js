import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        // ❌ Check if URI exists
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        // ✅ Connect to MongoDB
        const conn = await mongoose.connect(mongoURI, {
            dbName: process.env.DB_NAME || 'vemu_lms',
            serverSelectionTimeoutMS: 10000
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:');
        console.error(error.message);

        // 🔥 Show helpful hints
        console.log('\n🔍 Possible reasons:');
        console.log('1. Wrong MONGODB_URI in .env');
        console.log('2. Wrong username/password');
        console.log('3. IP not whitelisted in MongoDB Atlas');
        console.log('4. Internet issue');
        console.log('5. Cluster is paused');

        process.exit(1);
    }
};

export default connectDB;