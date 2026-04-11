const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // جميع المسارات هنا تحتاج تسجيل دخول

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);

module.exports = router;