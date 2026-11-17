const router = require('express').Router();
const db = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE user
router.post('/', async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!name || !membership_id) {
    return res.status(400).json({ error: 'Name and membership ID are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, role, password) VALUES (?, ?, ?, ?)',
      [name, membership_id, role || 'member', password || null]
    );
    res.status(201).json({ id: result.insertId, name, membership_id, role: role || 'member' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  try {
    if (password) {
      await db.query(
        'UPDATE users SET name=?, membership_id=?, role=?, password=? WHERE id=?',
        [name, membership_id, role, password, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
        [name, membership_id, role, req.params.id]
      );
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { membership_id, password } = req.body;
  if (!membership_id || !password) {
    return res.status(400).json({ error: 'Membership ID and password required' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, name, role FROM users WHERE membership_id=? AND password=?',
      [membership_id, password]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;