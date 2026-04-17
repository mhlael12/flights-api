const express = require('express');
const router = express.Router();

// استيراد الكنترولر
const { 
    getAllFlights, 
    getFlight,
    addFlight, 
    searchFlights, 
    updateFlight, 
    deleteFlight 
} = require('../controllers/flightController');

// استيراد الحماية (تأكد من المسار الصحيح)
const { protect, authorize } = require('../middleware/auth');

// --- 1. الروابط العامة ---
router.get('/search', searchFlights);
router.get('/', getAllFlights);
router.get('/:id', getFlight);

// --- 2. الروابط المحمية ---

// ملاحظة: قمت بإزالة validateFlight مؤقتاً لحين التأكد من وجود ملفها
router.post('/', 
    protect, 
    authorize('admin'), 
    addFlight
);

router.route('/:id')
    .put(protect, authorize('admin'), updateFlight)
    .delete(protect, authorize('admin'), deleteFlight);

module.exports = router;