const router = require('express').Router();
const db = require('../db');

// GET all books
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one book
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE book
router.post('/', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || !isbn) {
    return res.status(400).json({ error: 'Title, author and ISBN are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title, author, genre || null, isbn, quantity || 0]
    );
    res.status(201).json({ id: result.insertId, title, author, genre, isbn, quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE book
router.put('/:id', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title, author, genre, isbn, quantity, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;