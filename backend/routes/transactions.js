const router = require('express').Router();
const db = require('../db');

// GET all transactions (with book & user names)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, b.title AS book_title, u.name AS user_name
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE transaction — this handles stock logic atomically
router.post('/', async (req, res) => {
  const { book_id, user_id, type, quantity } = req.body;
  const qty = Number(quantity);

  if (!book_id || !type || !qty || qty < 1) {
    return res.status(400).json({ error: 'book_id, type and quantity are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch current stock
    const [books] = await conn.query('SELECT quantity FROM books WHERE id=?', [book_id]);
    if (!books.length) throw new Error('Book not found');

    let stock = books[0].quantity;

    if (type === 'borrow' || type === 'return') {
      if (!user_id) throw new Error('user_id is required for borrow/return');
    }

    if (type === 'borrow') {
      if (stock < qty) throw new Error(`Not enough stock (available: ${stock})`);
      stock -= qty;
    } else if (type === 'return' || type === 'add_stock') {
      stock += qty;
    } else {
      throw new Error('Invalid transaction type');
    }

    // Update stock
    await conn.query('UPDATE books SET quantity=? WHERE id=?', [stock, book_id]);

    // Log the transaction
    await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?,?,?,?)',
      [book_id, user_id || null, type, qty]
    );

    await conn.commit();
    res.status(201).json({ message: 'Transaction recorded', newStock: stock });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;