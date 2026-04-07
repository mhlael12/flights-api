const express = require('express');
const router = express.Router();
const { 
    getAllFlights, 
    addFlight, 
    searchFlights, 
    updateFlight, 
    deleteFlight 
} = require('../controllers/flightController');

// الروابط التي لا تحتاج معرف (ID)
router.route('/')
    .get(getAllFlights)
    .post(addFlight);

// رابط البحث
router.get('/search', searchFlights);

// الروابط التي تحتاج معرف (ID)
router.route('/:id')
    .put(updateFlight)
    .delete(deleteFlight);

module.exports = router;