const express = require('express');
const router = express.Router();
const { 
    getAllFlights, 
    getFlight,
    addFlight, 
    searchFlights, 
    updateFlight, 
    deleteFlight 
} = require('../controllers/flightController');

const { validateFlight } = require('../middleware/validateFlight');
const { protect, authorize } = require('../middleware/auth');

// --- 1. الروابط العامة (متاحة للجميع بدون Token) ---

// البحث (يجب وضعه قبل جلب رحلة محددة لتجنب التضارب)
router.get('/search', searchFlights);

// جلب كل الرحلات وجلب رحلة محددة
router.get('/', getAllFlights);
router.get('/:id', getFlight);


// --- 2. الروابط المحمية (تتطلب Token + رتبة Admin) ---

// إضافة رحلة جديدة
router.post('/', 
    protect, 
    authorize('admin'), 
    validateFlight, 
    addFlight
);

// تعديل وحذف الرحلات
router.route('/:id')
    .put(protect, authorize('admin'), updateFlight)
    .delete(protect, authorize('admin'), deleteFlight);

module.exports = router;