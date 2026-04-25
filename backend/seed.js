import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'vemu_lms';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
        console.log('✅ Connected to MongoDB');
        const db = mongoose.connection.db;
        await db.collection('users').deleteMany({});
        await db.collection('books').deleteMany({});
        await db.collection('transactions').deleteMany({});
        await db.collection('requests').deleteMany({});
        await db.collection('counters').deleteMany({});
        await db.collection('counters').insertMany([{ _id: 'userId', seq: 6 }, { _id: 'transactionId', seq: 5 }]);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('Vemu@2025', salt);
        const now = new Date();
        const past = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };
        const future = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt; };
        await db.collection('users').insertMany([
            { userId:'USR001', firstName:'Dr. Ramu', lastName:'Reddy', email:'ramu.admin@vemu.ac.in', username:'ramu_admin', password:hash, role:'admin', status:'Active', createdAt:now, updatedAt:now },
            { userId:'USR002', firstName:'Mrs. Padma', lastName:'Vathi', email:'padma.lib@vemu.ac.in', username:'padma_lib', password:hash, role:'librarian', status:'Active', createdAt:now, updatedAt:now },
            { userId:'USR003', firstName:'Prof. Suresh', lastName:'Babu', email:'suresh.fac@vemu.ac.in', username:'suresh_fac', password:hash, role:'faculty', status:'Active', createdAt:now, updatedAt:now },
            { userId:'USR004', firstName:'Arjun', lastName:'Sharma', email:'arjun.stu@vemu.ac.in', username:'arjun_stu', password:hash, role:'student', status:'Active', createdAt:now, updatedAt:now },
            { userId:'USR005', firstName:'Priya', lastName:'Reddy', email:'priya.stu@vemu.ac.in', username:'priya_stu', password:hash, role:'student', status:'Active', createdAt:now, updatedAt:now },
            { userId:'USR006', firstName:'Dr. Anu', lastName:'Devi', email:'anu.fac@vemu.ac.in', username:'anu_fac', password:hash, role:'faculty', status:'Inactive', createdAt:now, updatedAt:now },
        ]);
        await db.collection('books').insertMany([
            { isbn:'978-0134685991', title:'Effective Java', author:'Joshua Bloch', category:'Programming', totalQuantity:5, availableQuantity:3, createdAt:now, updatedAt:now },
            { isbn:'978-0596517748', title:'JavaScript: The Good Parts', author:'Douglas Crockford', category:'Programming', totalQuantity:4, availableQuantity:2, createdAt:now, updatedAt:now },
            { isbn:'978-0132350884', title:'Clean Code', author:'Robert C. Martin', category:'Programming', totalQuantity:6, availableQuantity:6, createdAt:now, updatedAt:now },
            { isbn:'978-0201633610', title:'Design Patterns', author:'Gang of Four', category:'Programming', totalQuantity:3, availableQuantity:1, createdAt:now, updatedAt:now },
            { isbn:'978-0131101630', title:'The C Programming Language', author:'Kernighan & Ritchie', category:'Programming', totalQuantity:8, availableQuantity:7, createdAt:now, updatedAt:now },
            { isbn:'978-0132774252', title:'Python Programming', author:'John Zelle', category:'Programming', totalQuantity:5, availableQuantity:4, createdAt:now, updatedAt:now },
            { isbn:'978-0470177082', title:'Computer Networks', author:'Andrew Tanenbaum', category:'Networking', totalQuantity:4, availableQuantity:3, createdAt:now, updatedAt:now },
            { isbn:'978-0132126953', title:'Data Communications', author:'Forouzan', category:'Networking', totalQuantity:3, availableQuantity:3, createdAt:now, updatedAt:now },
            { isbn:'978-0132774262', title:'Digital Electronics', author:'Morris Mano', category:'Electronics', totalQuantity:5, availableQuantity:5, createdAt:now, updatedAt:now },
            { isbn:'978-8120334960', title:'Engineering Mathematics', author:'B.S. Grewal', category:'Mathematics', totalQuantity:10, availableQuantity:8, createdAt:now, updatedAt:now },
            { isbn:'978-0136086208', title:'Database System Concepts', author:'Silberschatz', category:'Database', totalQuantity:4, availableQuantity:4, createdAt:now, updatedAt:now },
            { isbn:'978-1118063330', title:'Operating System Concepts', author:'Galvin', category:'Operating Systems', totalQuantity:4, availableQuantity:3, createdAt:now, updatedAt:now },
        ]);
        await db.collection('transactions').insertMany([
            { transactionId:'TXN0001', userId:'USR004', userName:'Arjun Sharma', isbn:'978-0134685991', bookTitle:'Effective Java', userRole:'student', issueDate:past(30), dueDate:past(16), returnDate:null, status:'Overdue', fine:32, createdAt:past(30), updatedAt:now },
            { transactionId:'TXN0002', userId:'USR004', userName:'Arjun Sharma', isbn:'978-0596517748', bookTitle:'JavaScript: The Good Parts', userRole:'student', issueDate:past(10), dueDate:future(4), returnDate:null, status:'Active', fine:0, createdAt:past(10), updatedAt:now },
            { transactionId:'TXN0003', userId:'USR005', userName:'Priya Reddy', isbn:'978-0201633610', bookTitle:'Design Patterns', userRole:'student', issueDate:past(20), dueDate:past(6), returnDate:past(3), status:'Returned', fine:0, createdAt:past(20), updatedAt:past(3) },
            { transactionId:'TXN0004', userId:'USR003', userName:'Prof. Suresh Babu', isbn:'978-0131101630', bookTitle:'The C Programming Language', userRole:'faculty', issueDate:past(5), dueDate:future(25), returnDate:null, status:'Active', fine:0, createdAt:past(5), updatedAt:now },
            { transactionId:'TXN0005', userId:'USR004', userName:'Arjun Sharma', isbn:'978-0132774252', bookTitle:'Python Programming', userRole:'student', issueDate:past(40), dueDate:past(26), returnDate:past(25), status:'Returned', fine:0, createdAt:past(40), updatedAt:past(25) },
        ]);
        await db.collection('requests').insertMany([
            { userId:'USR003', userName:'Prof. Suresh Babu', userEmail:'suresh.fac@vemu.ac.in', bookTitle:'AI: A Modern Approach', authorOrIsbn:'Russell & Norvig', courseName:'CS401', reason:'AI course syllabus', status:'Pending', createdAt:past(14), updatedAt:past(14) },
            { userId:'USR006', userName:'Dr. Anu Devi', userEmail:'anu.fac@vemu.ac.in', bookTitle:'Digital Signal Processing', authorOrIsbn:'Proakis', courseName:'ECE301', reason:'Lab reference', status:'Approved', createdAt:past(16), updatedAt:past(10) },
            { userId:'USR003', userName:'Prof. Suresh Babu', userEmail:'suresh.fac@vemu.ac.in', bookTitle:'Machine Learning Yearning', authorOrIsbn:'Andrew Ng', courseName:'CS501', reason:'ML elective reference', status:'Rejected', createdAt:past(23), updatedAt:past(20) },
        ]);
        console.log('\n✅ Database seeded!');
        console.log('\n🔑 Login Credentials (password: Vemu@2025):');
        console.log('  Admin     : ramu_admin');
        console.log('  Librarian : padma_lib');
        console.log('  Faculty   : suresh_fac');
        console.log('  Student   : arjun_stu  /  priya_stu');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}
seed();
