# 📚 Library Management System

A full-stack web application for managing a library — books, users, borrowing,
and stock tracking. Built for **Web Application Development (BIWA2110)**.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, React Hooks |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Communication | Fetch API (REST) |
| Styling | Inline JS styles / CSS |

## ✨ Features

### Books
- Add, edit, delete books (title, author, genre, ISBN, quantity)
- Duplicate ISBN prevention (unique constraint)
- Form validation

### Users
- Login (membership ID + password)
- Admin CRUD: add, edit, delete users
- Role badges (admin / member)

### Transactions
- **Borrow** a book → stock decreases
- **Return** a book → stock increases
- **Add stock** → for new arrivals
- **Atomic operations** — uses SQL `BEGIN / COMMIT / ROLLBACK` so
  stock never gets corrupted if something fails mid-operation
- Full transaction history with joined book/user names

### Dashboard
- Card statistics: total books, low stock, total copies
- Book availability table
- **Low stock highlighted** (quantity < 2)

## 📁 Project Structure

```
library-management-system/
├── frontend/                 # React app
│   └── src/
│       ├── components/       # Navbar
│       ├── pages/            # Dashboard, Books, Users, Transactions
│       ├── services/         # api.js (all fetch calls)
│       ├── App.jsx
│       └── main.jsx
├── backend/                  # Express API
│   ├── routes/               # books.js, users.js, transactions.js
│   ├── db.js                 # MySQL pool
│   ├── server.js             # Express entry point
│   ├── .env.example          # Environment template
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js (v18+)
- MySQL Server + MySQL Workbench

### 1. Clone the repo
```bash
git clone https://github.com/phetanetseleabram-creator/Library Management System_2.git
cd Library Management System_2
```

### 2. Create the database

Open **MySQL Workbench** and run:

```sql
CREATE DATABASE library_db;
USE library_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  membership_id VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150) NOT NULL,
  genre VARCHAR(100),
  isbn VARCHAR(20) UNIQUE NOT NULL,
  quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT,
  type ENUM('borrow', 'return', 'add_stock') NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. Setup backend
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your MySQL password:
```bash
cp .env.example .env
# then edit .env — set DB_PASSWORD to your real MySQL root password
```

Start the backend:
```bash
npm run dev
```
Server runs on **http://localhost:5000**

### 4. Setup frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

### 5. Open the app
Visit **http://localhost:5173** in your browser.

## 🔌 API Endpoints

### Books
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get one book |
| POST | `/books` | Create a book |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users` | Get all users |
| POST | `/users` | Create a user |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |
| POST | `/users/login` | Authenticate a user |

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/transactions` | Get all transactions (with joins) |
| POST | `/transactions` | Create borrow/return/add_stock event |

## 🧠 Key Implementation Notes

- **Atomic transactions**: The `/transactions` route uses `BEGIN TRANSACTION`,
  re-checks stock, updates the books table, inserts the transaction row,
  then `COMMIT`. If any step throws, `ROLLBACK` runs — preventing stock from
  being incorrectly reduced without a recorded transaction.
- **Low-stock highlighting**: Dashboard and Books list use conditional row
  styling when `quantity < 2`.
- **Reusable Field component**: Form inputs (`Field`) are shared across
  Books and Users pages.
- **Controlled forms** with per-field validation before submit.

## 👤 Author

**Your Name** — [Your Student ID]
Web Application Development (BIWA2110)
Limkokwing University — Faculty of Information Communication Technology

## 📄 License

Academic project — not for commercial use.