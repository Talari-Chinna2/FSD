import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
    username: z.string().min(3).max(50).trim(),
    password: z.string().min(6).max(100)
});

export const registerUserSchema = z.object({
    firstName: z.string().min(2).max(50).trim(),
    lastName: z.string().min(2).max(50).trim(),
    email: z.string().email().trim().toLowerCase(),
    username: z.string().min(3).max(50).trim().toLowerCase(),
    password: z.string().min(6).max(100),
    role: z.enum(['admin', 'librarian', 'faculty', 'student']).default('student'),
    status: z.enum(['Active', 'Inactive']).default('Active')
});

export const updateUserSchema = z.object({
    firstName: z.string().min(2).max(50).trim().optional(),
    lastName: z.string().min(2).max(50).trim().optional(),
    email: z.string().email().trim().toLowerCase().optional(),
    role: z.enum(['admin', 'librarian', 'faculty', 'student']).optional(),
    status: z.enum(['Active', 'Inactive']).optional()
});

// Book validation schemas
export const createBookSchema = z.object({
    isbn: z.string().min(10).max(20).trim(),
    title: z.string().min(2).max(200).trim(),
    author: z.string().min(2).max(100).trim(),
    category: z.string().min(2).max(50).trim(),
    totalQuantity: z.number().int().min(1).default(1),
    availableQuantity: z.number().int().min(0).optional(),
    description: z.string().max(500).trim().optional()
}).refine(data => {
    const avail = data.availableQuantity !== undefined ? data.availableQuantity : data.totalQuantity;
    return avail <= data.totalQuantity;
}, { message: 'Available quantity cannot exceed total quantity' });

export const updateBookSchema = z.object({
    title: z.string().min(2).max(200).trim().optional(),
    author: z.string().min(2).max(100).trim().optional(),
    category: z.string().min(2).max(50).trim().optional(),
    totalQuantity: z.number().int().min(1).optional(),
    availableQuantity: z.number().int().min(0).optional(),
    description: z.string().max(500).trim().optional()
}).refine(data => {
    if (data.availableQuantity !== undefined && data.totalQuantity !== undefined) {
        return data.availableQuantity <= data.totalQuantity;
    }
    return true;
}, { message: 'Available quantity cannot exceed total quantity' });

// Transaction validation schemas
export const issueBookSchema = z.object({
    userId: z.string().min(3).max(20).trim(),
    isbn: z.string().min(10).max(20).trim(),
    dueDate: z.string().datetime()
});

export const reserveBookSchema = z.object({
    isbn: z.string().min(10).max(20).trim(),
    dueDate: z.string().datetime()
});

// Request validation schemas
export const createRequestSchema = z.object({
    bookTitle: z.string().min(2).max(200).trim(),
    authorOrIsbn: z.string().min(2).max(200).trim(),
    courseName: z.string().max(100).trim().optional(),
    reason: z.string().max(500).trim().optional()
});

// Validation middleware helper
export function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            const issues = Array.isArray(error?.issues)
                ? error.issues
                : Array.isArray(error?.errors)
                    ? error.errors
                    : [];

            // Don't call next(error) - send response directly
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
    };
}
