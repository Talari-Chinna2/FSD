# Quick Start Guide - Vemu LMS

## 🚀 Your Application is Ready!

### Current Status
✅ Server running on: http://localhost:3000
✅ Deployed backend at: https://fsd-backend-wltp.onrender.com
✅ MongoDB connected successfully
✅ Database seeded with sample data

### 🔐 Login Credentials
All users have password: `pass123`

| Click to Login | Role | What You Can Do |
|---------------|------|-----------------|
| 👑 Admin | `admin` | Manage users, books, view reports |
| 🗂️ Librarian | `lib` | Issue/return books, manage inventory |
| 👨‍🏫 Faculty | `fac` | Browse catalog, request books |
| 🎓 Student | `stu` | View borrowed books, check fines |

### 📁 Project Structure
```
CHINNA-FSD-PROJECT/
├── 📱 Frontend
│   └── public/index.html          # Web interface
│
├── 🔧 Backend (Node.js + Express)
│   ├── server.js                  # Main server file
│   ├── seed.js                    # Database seeder
│   └── src/
│       ├── config/database.js     # MongoDB connection
│       ├── models/                # Database schemas
│       │   ├── User.js
│       │   ├── Book.js
│       │   ├── Transaction.js
│       │   └── Request.js
│       ├── routes/                # API endpoints
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── books.js
│       │   ├── transactions.js
│       │   └── requests.js
│       └── middleware/auth.js     # Authentication
│
└── ⚙️ Configuration
    ├── .env                       # Environment variables
    └── package.json
```

### 🎯 How to Use

1. **Open the application**: http://localhost:3000
2. **Click a quick login button** or enter credentials manually
3. **Explore the dashboard** based on your role

### 📊 Sample Data Included
- 4 Users (admin, librarian, faculty, student)
- 12 Books across different categories
- Ready for testing all features

### 🛠️ Common Commands

```bash
# Start server (if stopped)
npm start

# Restart with auto-reload
npm run dev

# Re-seed database
npm run seed

# Install new packages
npm install <package-name>
```

### 🔗 API Testing

You can test the API directly:

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass123"}'

# Get books (after getting token)
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🎨 Features to Test

✅ **Login System**
- Click quick login buttons
- Enter credentials manually
- Session persistence (stays logged in on refresh)

✅ **Dashboard**
- View real-time statistics
- See recent transactions
- Browse book inventory

✅ **Role-Based Access**
- Different views for each role
- Different permissions
- Color-coded UI themes

### 📝 MongoDB Connection

Your database is hosted on MongoDB Atlas:
- Cluster: Cluster2
- Database: vemu_lms
- Status: ✅ Connected

### 🐛 Troubleshooting

**Server won't start?**
```bash
npm install
npm start
```

**Database issues?**
```bash
npm run seed
```

**Port 3000 in use?**
Edit `.env` file: `PORT=3001`

### 📖 Next Steps

1. Test all login flows
2. Try creating new users/books
3. Issue and return books
4. Check the dashboard statistics
5. Build additional features as needed

---

**Happy Coding! 🎉**
