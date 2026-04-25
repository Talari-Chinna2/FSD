# Vemu LMS - Library Management System

A full-stack web application for managing library operations at Vemu Institute of Technology.

## Features

- **Multi-Role Access**: Admin, Librarian, Faculty, and Student portals
- **Book Management**: Add, edit, delete books with ISBN tracking
- **User Management**: Create and manage user accounts
- **Circulation**: Issue and return books with due date tracking
- **Fine Calculation**: Automatic fine calculation for overdue books (₹2/day)
- **Faculty Requests**: Request syllabus materials
- **QR Code Support**: Scan QR codes for quick user registration
- **Real-time Dashboard**: Statistics and analytics

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** (Atlas Cloud)
- **Mongoose** for ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **Vanilla HTML/CSS/JavaScript**
- **RESTful API** integration
- **Modern dark UI** with role-based theming

## Project Structure

```
CHINNA-FSD-PROJECT/
├── public/
│   └── index.html          # Frontend application
├── src/
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Book.js         # Book schema
│   │   ├── Transaction.js  # Transaction schema
│   │   └── Request.js      # Request schema
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js        # User management routes
│   │   ├── books.js        # Book management routes
│   │   ├── transactions.js # Transaction routes
│   │   └── requests.js     # Request routes
│   └── middleware/
│       └── auth.js         # JWT authentication middleware
├── .env                    # Environment variables
├── .gitignore
├── server.js               # Express server entry point
├── seed.js                 # Database seeding script
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (already configured)

- ### Deployment
- **Backend URL**: https://fsd-backend-wltp.onrender.com
- **Frontend**: Deployed separately (update `API_BASE` in `frontend/public/index.html` to point to the backend)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database with sample data:
```bash
npm run seed
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Default Login Credentials

All users have the password: `pass123`

| Username | Role      | Description           |
|----------|-----------|-----------------------|
| admin    | Admin     | System administrator  |
| lib      | Librarian | Library staff         |
| fac      | Faculty   | Faculty member        |
| stu      | Student   | Student user          |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Users
- `GET /api/users` - Get all users (admin/librarian)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:isbn` - Get book by ISBN
- `POST /api/books` - Create book (admin/librarian)
- `PUT /api/books/:isbn` - Update book (admin/librarian)
- `DELETE /api/books/:isbn` - Delete book (admin)
- `GET /api/books/categories/list` - Get all categories

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/issue` - Issue book to user
- `POST /api/transactions/return/:transactionId` - Return book
- `GET /api/transactions/stats/dashboard` - Get dashboard statistics

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create request (faculty)
- `PATCH /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request

## Database Schema

### User
- userId, firstName, lastName, email, username, password
- role (admin/librarian/faculty/student)
- status (Active/Inactive)

### Book
- isbn, title, author, category
- totalQuantity, availableQuantity

### Transaction
- transactionId, userId, isbn, bookTitle, userName
- issueDate, dueDate, returnDate
- status (Active/Returned/Overdue), fine

### Request
- userId, userName, userEmail
- bookTitle, authorOrIsbn, courseName, reason
- status (Pending/Approved/Rejected)

## Features in Detail

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Session persistence with localStorage

### Book Circulation
- Issue books with customizable due dates
- Automatic fine calculation (₹2/day for overdue)
- Track borrowing history per user
- Availability tracking

### User Management
- Create, edit, delete user accounts
- Role assignment (admin, librarian, faculty, student)
- Active/Inactive status management
- Email uniqueness validation

### Dashboard Analytics
- Total users, books, active issues
- Overdue tracking
- Category distribution
- Most borrowed books statistics

## Environment Variables

```env
MONGODB_URI=mongodb://...
DB_NAME=vemu_lms
PORT=3000
JWT_SECRET=your_secret_key
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Re-seeding Database
```bash
npm run seed
```

Note: Seeding will clear existing data and create fresh sample data.

## Security Considerations

- Change JWT_SECRET in production
- Enable HTTPS for production
- Implement rate limiting
- Add input validation middleware
- Enable CORS only for allowed origins

## Future Enhancements

- Email notifications for due dates
- PDF report generation
- Advanced search and filters
- Bulk operations
- Export to CSV/Excel
- Mobile responsive improvements
- Barcode scanning
- Reservation system

## License

MIT

## Support

For issues or questions, please contact the development team.
