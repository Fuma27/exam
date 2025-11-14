// server/routes/auth.js — FINAL 100% WORKING
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        student_id: user.student_id,
        role: user.role || 'student'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// SIGNUP — WITH ROLE + MAX 1 ADMIN
router.post('/signup', async (req, res) => {
  const { name, email, student_id, password, role } = req.body;

  if (!name || !email || !student_id || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    // MAX 1 ADMIN
    if (role === 'admin') {
      const [admins] = await db.query("SELECT * FROM users WHERE role = 'admin'");
      if (admins.length >= 1) {
        return res.status(400).json({ error: 'Only 1 admin allowed!' });
      }
    }

    // CHECK DUPLICATES
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ? OR student_id = ?',
      [email.trim().toLowerCase(), student_id.trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or Student ID exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const finalRole = role === 'admin' ? 'admin' : 'student';

    await db.query(
      'INSERT INTO users (name, email, student_id, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), student_id.trim(), hashed, finalRole]
    );

    res.json({ success: true, message: `Registered as ${finalRole.toUpperCase()}!` });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;