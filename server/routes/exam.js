// routes/exam.js or in your main server file
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Exam registration endpoint
router.post('/register', upload.single('slip'), async (req, res) => {
  try {
    const studentData = JSON.parse(req.body.studentData);
    const slipFile = req.file;

    console.log('Received exam registration:', studentData);
    
    // Validate required fields
    if (!studentData.faculty_id || !studentData.degree || !studentData.selectedCourses || studentData.selectedCourses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Here you would typically save to database
    // For now, we'll simulate successful registration
    
    const registrationRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...studentData,
      slipFilename: slipFile ? slipFile.filename : null,
      status: 'registered',
      verified: true
    };

    console.log('Registration successful:', registrationRecord);

    res.status(201).json({
      success: true,
      message: 'Exam registration submitted successfully',
      registrationId: registrationRecord.id,
      verificationCode: studentData.verificationCode,
      data: registrationRecord
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

module.exports = router;