# Vemu LMS - Complete Feature Documentation

## 🎯 Real-World Full-Stack Application

A comprehensive web-based Library Management System with 4 role-based dashboards, real-time MongoDB connectivity, and complete CRUD operations.

---

## 📊 4 COMPLETE DASHBOARDS

### 1. 👑 ADMIN DASHBOARD

**Access:** Username: `admin`, Password: `pass123`

#### Features:
✅ **Dashboard Overview**
- Total Users (Active/Inactive breakdown)
- Total Books (with quantity tracking)
- Active Issues (currently borrowed books)
- Overdue Books (automatic tracking)
- Pending Requests (faculty purchase requests)
- Recent Users table (last 5 registered)
- Recent Transactions table (last 10)
- Quick action cards

✅ **User Management**
- Create new users with role assignment
- Edit existing user profiles
- Delete users (with confirmation)
- Search users by name, email, ID, role
- Filter users by role (Admin/Librarian/Faculty/Student)
- View user status (Active/Inactive)
- Real-time user count display

✅ **Book Inventory Management**
- View complete book database
- Search books by title, author, ISBN
- Filter books by category
- Track availability (Available/Total quantity)
- Visual availability bars (green/yellow/red)
- Real-time book count

✅ **Transaction Monitoring**
- View all library transactions
- Search transactions by TXN ID, user, book
- Filter by status (Active/Returned/Overdue)
- Track issue dates and due dates
- Monitor borrowing patterns

✅ **Reports & Analytics**
- Total Issues, Returned, Overdue statistics
- Category Distribution (visual bars with percentages)
- Most Borrowed Books (top 5 ranking)
- Color-coded analytics
- Real-time data updates

✅ **Database Backup & Restore**
- Export entire database as JSON file
- Import/Restore from backup files
- Timestamped backup filenames
- Data integrity preservation
- One-click restore with confirmation

---

### 2. 🗂️ LIBRARIAN DASHBOARD

**Access:** Username: `lib`, Password: `pass123`

#### Features:
✅ **Circulation Desk**
- Active Issues count (real-time)
- Overdue Books tracking
- Total Books in inventory
- Pending Faculty Requests badge
- Recent Transactions table with return buttons
- One-click book returns

✅ **Book Inventory Management**
- Add new books with full details (ISBN, title, author, category, quantities)
- Edit existing book information
- Delete lost/damaged books
- Search books by title, author, ISBN
- Filter by category dropdown
- Track available vs total quantity
- Visual availability indicators
- Real-time inventory updates

✅ **Issue / Return System**
- Quick Issue panel:
  - Enter Book ISBN
  - Enter User ID
  - Set Due Date (auto-defaults to 14 days)
  - Issue Book button (validates availability)
  - Return Book button (processes returns)
- All Transactions table:
  - View all active and returned books
  - One-click return processing
  - Status badges (Active/Returned/Overdue)
  - Transaction ID tracking
- Automatic availability updates
- Fine calculation on overdue returns (₹2/day)

✅ **Faculty Request Management**
- View all faculty purchase requests
- See request details (book title, author, course, reason)
- Approve requests with one click
- Track request status (Pending/Approved/Rejected)
- Badge notification count for pending requests
- Request status filtering

---

### 3. 👨‍🏫 FACULTY DASHBOARD

**Access:** Username: `fac`, Password: `pass123`

#### Features:
✅ **My Dashboard**
- Borrowed Books count (currently active)
- Pending Requests count (submitted to librarian)
- Overdue Books alert
- Overdue notifications (high severity banners)
- My Borrowed Books table:
  - ISBN, Title, Issue Date, Due Date
  - Days remaining calculation
  - Status badges (Active/Overdue)
  - Color-coded alerts for overdue books
- **Extended 30-day borrowing** (vs 14 days for students)

✅ **Browse Catalog**
- Search entire library by title, author, category
- View book availability status
- Available books show quantity
- Unavailable books marked clearly
- Grid card layout for easy browsing
- Real-time availability updates

✅ **Request Books**
- Submit syllabus material requests:
  - Book Title (required)
  - Author / ISBN (required)
  - Course Name / Code (optional)
  - Reason for Request (textarea)
- View submitted requests history
- Track request status (Pending/Approved/Rejected)
- Color-coded status badges
- Request submission confirmations

✅ **Special Privileges**
- Extended borrowing period (30 days max)
- Priority request handling
- Reserve books for courses
- Recommend new acquisitions to librarian

---

### 4. 🎓 STUDENT DASHBOARD

**Access:** Username: `stu`, Password: `pass123`

#### Features:
✅ **My Dashboard**
- Currently Borrowed count (max 3 books limit)
- Pending Fine calculation (₹2/day per overdue book)
- Overdue Books count
- **Overdue Notifications:**
  - Red banners for overdue books with days and fine amount
  - Yellow banners for books due within 2 days
  - Severity-based sorting (high/medium)
  - Real-time notification updates
- **Fine Payment Card:**
  - Outstanding fine amount display
  - "Pay Now" button (payment gateway redirect)
  - Per-day fine rate display (₹2/day)
- My Borrowed Books table:
  - ISBN, Title, Issue Date, Due Date
  - Days remaining calculation
  - Status badges (Active/Overdue)
  - Automatic status updates

✅ **Browse Catalog**
- Search books by title, author, category
- Filter by category dropdown
- View real-time availability:
  - ✓ Available (with quantity count in green)
  - ✕ Unavailable (in red)
- Grid card layout
- Maximum 3 books borrowing limit enforced
- Search and filter combinations

✅ **Borrowing History**
- Complete transaction history
- Transaction ID tracking
- Book titles borrowed
- Issue and return dates
- Status of all transactions (Active/Returned/Overdue)
- Historical fine tracking
- Downloadable records

---

## 🔧 TECHNICAL FEATURES

### Backend (Node.js + Express + MongoDB)

✅ **Database:**
- MongoDB Atlas Cloud Database
- 4 Collections: Users, Books, Transactions, Requests
- Auto-incrementing IDs (USR001, TXN0001, etc.)
- Indexed fields for fast queries
- Aggregation pipelines for analytics

✅ **Authentication:**
- JWT (JSON Web Tokens)
- Password hashing with bcrypt
- Role-based access control
- Session persistence with localStorage
- Secure token validation

✅ **API Endpoints:**
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - Register user
GET    /api/users               - Get all users (admin/lib)
POST   /api/users               - Create user (admin)
PUT    /api/users/:id           - Update user (admin)
DELETE /api/users/:id           - Delete user (admin)
GET    /api/books               - Get all books
POST   /api/books               - Create book (admin/lib)
PUT    /api/books/:isbn         - Update book (admin/lib)
DELETE /api/books/:isbn         - Delete book (admin)
GET    /api/books/categories/list - Get categories
GET    /api/transactions        - Get transactions
POST   /api/transactions/issue  - Issue book (admin/lib)
POST   /api/transactions/return/:id - Return book (admin/lib)
POST   /api/transactions/reserve - Reserve book (faculty)
GET    /api/transactions/user/:id - User transactions
GET    /api/transactions/stats/dashboard - Dashboard stats
GET    /api/requests            - Get requests
POST   /api/requests            - Create request (faculty)
PATCH  /api/requests/:id/status - Update status (admin/lib)
DELETE /api/requests/:id        - Delete request (admin/lib)
POST   /api/admin/backup        - Backup database (admin)
POST   /api/admin/restore       - Restore database (admin)
GET    /api/admin/dashboard     - Comprehensive dashboard
GET    /api/admin/notifications - User notifications
GET    /api/health              - Health check
```

✅ **Real-Time Features:**
- Live database queries on every action
- Automatic UI updates after CRUD operations
- Real-time availability tracking
- Dynamic notification generation
- Instant fine calculations
- Cache synchronization

---

### Frontend (Vanilla HTML/CSS/JS)

✅ **UI/UX:**
- Modern dark theme with role-based colors
- Responsive design (desktop/tablet/mobile)
- Smooth animations and transitions
- Toast notifications for all actions
- Modal dialogs for forms
- Card-based layouts
- Table views with hover effects
- Visual availability indicators
- Badge notifications
- Loading states

✅ **Color Scheme:**
```
Admin:     Red (#f05545)
Librarian: Blue (#4fa3e0)
Faculty:   Purple (#a78bfa)
Student:   Green (#34d399)
Fine/Warning: Gold (#f5c842)
```

✅ **Components:**
- Login page with quick login chips
- Sidebar navigation with role-based menus
- Topbar with user info and actions
- Stats cards with icons and numbers
- Data tables with sorting
- Search inputs with filters
- Quick action cards
- Notification banners
- Fine payment cards
- Modal forms
- Toast notifications
- Availability bars
- Report visualization bars

---

## 📋 REQUIREMENTS COVERAGE

### ✅ 1. General Requirements
- ✅ Unique username/password login
- ✅ Role-based access (Admin, Librarian, Faculty, Student)
- ✅ Accurate library records (MongoDB)
- ✅ Web-based interface

### ✅ 2. Admin Requirements
- ✅ Create, update, delete user accounts
- ✅ Assign roles to users
- ✅ View all library records
- ✅ Generate reports (users, books, transactions)
- ✅ Backup and restore database

### ✅ 3. Librarian Requirements
- ✅ Add new books
- ✅ Update book details (title, author, edition, subject)
- ✅ Delete lost/damaged books
- ✅ Issue books to students and faculty
- ✅ Accept returned books
- ✅ Calculate fines for late returns (₹2/day)
- ✅ Check book availability
- ✅ Generate issue/return reports

### ✅ 4. Student Requirements
- ✅ Login with student credentials
- ✅ Search books by title, author, subject, ISBN
- ✅ View book availability status
- ✅ Request book issue (with 3-book limit)
- ✅ View issued books and due dates
- ✅ Notifications for due dates and fines

### ✅ 5. Faculty Requirements
- ✅ Login with faculty credentials
- ✅ Search and reserve books
- ✅ Borrow books for longer duration (30 days)
- ✅ Recommend new books to librarian
- ✅ View borrowing history

### ✅ 6. Non-Functional Requirements
- ✅ Easy to use, minimal training needed
- ✅ Data security and privacy (JWT, bcrypt)
- ✅ Fast response times (indexed DB queries)
- ✅ Multiple simultaneous users (stateless API)
- ✅ Scalable for more books and users

### ✅ 7. UI Requirements
- ✅ Simple login screen for all users
- ✅ Dashboards for Admin and Librarian
- ✅ Search and filter options for books
- ✅ Clear issue/return status display
- ✅ Alert messages for due dates and fines

---

## 🚀 QUICK START

### Login Credentials (all passwords: `pass123`)

| Username | Role | Portal |
|----------|------|--------|
| admin | Admin | Full system management |
| lib | Librarian | Circulation desk |
| fac | Faculty | Extended borrowing |
| stu | Student | Standard borrowing |

### Access the Application
```
http://localhost:3000
```

### Commands
```bash
# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Re-seed database
npm run seed

# Backup database
# Use Admin dashboard → Backup/Restore → Export
```

---

## 📦 Sample Data Included

- **4 Users** (one per role)
- **12 Books** across 6 categories:
  - Programming (6 books)
  - Networking (2 books)
  - Electronics (1 book)
  - Mathematics (1 book)
  - Database (1 book)
  - Operating Systems (1 book)
- **Ready for immediate testing**

---

## 🎨 Design Highlights

✅ **Same Color Scheme** as original design
✅ **Real-Time MongoDB** connection
✅ **All Requested Features** implemented
✅ **Production-Ready** architecture
✅ **Responsive** across devices
✅ **Secure** authentication and authorization
✅ **Scalable** database design

---

## 📞 Support

For issues or feature requests, check the application logs or contact the development team.

**Enjoy your full-stack Library Management System! 🎉**
