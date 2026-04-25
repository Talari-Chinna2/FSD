import express from 'express';
import Book from '../models/Book.js';
import { auth, authorize } from '../middleware/auth.js';
import { validate, createBookSchema, updateBookSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        const books = await Book.find(query).sort({ title: 1 });

        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: error.message
        });
    }
});

// Get categories (MUST be before /:isbn to avoid route conflict)
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Book.distinct('category');

        res.json({
            success: true,
            data: categories.sort()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

// Get book by ISBN
router.get('/:isbn', async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book',
            error: error.message
        });
    }
});

// Create book (admin/librarian only)
router.post('/', auth, authorize('admin', 'librarian'), validate(createBookSchema), async (req, res) => {
    try {
        const { isbn, title, author, category, totalQuantity, availableQuantity, description } = req.body;

        const existingBook = await Book.findOne({ isbn });

        if (existingBook) {
            return res.status(400).json({
                success: false,
                message: 'Book already exists with this ISBN'
            });
        }

        const book = new Book({
            isbn,
            title,
            author,
            category,
            totalQuantity: totalQuantity || 0,
            availableQuantity: availableQuantity !== undefined ? availableQuantity : totalQuantity || 0,
            description
        });

        await book.save();

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add book',
            error: error.message
        });
    }
});

// Update book (admin/librarian only)
router.put('/:isbn', auth, authorize('admin', 'librarian'), validate(updateBookSchema), async (req, res) => {
    try {
        const { title, author, category, totalQuantity, availableQuantity, description } = req.body;

        const book = await Book.findOne({ isbn: req.params.isbn });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.category = category || book.category;

        if (totalQuantity !== undefined) {
            book.totalQuantity = totalQuantity;
        }
        if (availableQuantity !== undefined) {
            book.availableQuantity = availableQuantity;
        }

        book.description = description || book.description;

        await book.save();

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: error.message
        });
    }
});

// Delete book (admin only)
router.delete('/:isbn', auth, authorize('admin'), async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        await Book.findOneAndDelete({ isbn: req.params.isbn });

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete book',
            error: error.message
        });
    }
});

export default router;
