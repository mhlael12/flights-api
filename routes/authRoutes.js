const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// رابط التسجيل: POST /api/auth/register
router.post('/register', register);

router.post('/register', register);
router.post('/login', login); // الرابط الجديد

module.exports = router;