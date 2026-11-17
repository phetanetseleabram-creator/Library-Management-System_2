const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/books', require('./routes/books'));
app.use('/users', require('./routes/users'));
app.use('/transactions', require('./routes/transactions'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Library API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));