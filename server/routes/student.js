const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Register for exams
router.post('/register', upload.single('fee_slip'), async (req, res) => {
  const { user_id, course_ids } = req.body;
  const fee_slip = req.file ? req.file.filename : null;

  try {
    for (let course_id of JSON.parse(course_ids)) {
      await db.query(
        'INSERT INTO registrations (user_id, course_id, fee_slip) VALUES (?, ?, ?)',
        [user_id, course_id, fee_slip]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get student's registered courses
router.get('/my-courses/:user_id', async (req, res) => {
  const [rows] = await db.query(`
    SELECT c.*, r.fee_slip, r.confirmed 
    FROM registrations r 
    JOIN courses c ON r.course_id = c.id 
    WHERE r.user_id = ?
  `, [req.params.user_id]);
  res.json(rows);
});

module.exports = router;