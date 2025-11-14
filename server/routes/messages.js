const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get messages for user
router.get('/:user_id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.user_id]
  );
  res.json(rows);
});

// Send message (admin to student)
router.post('/', async (req, res) => {
  const { user_id, from_user, message } = req.body;
  await db.query(
    'INSERT INTO messages (user_id, from_user, message) VALUES (?, ?, ?)',
    [user_id, from_user, message]
  );
  res.json({ success: true });
});

// Mark as read
router.put('/read/:id', async (req, res) => {
  await db.query('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;