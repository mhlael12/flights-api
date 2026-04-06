const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.getAllFlights);
router.post('/add', flightController.addFlight);
router.get('/search', flightController.searchFlights);
module.exports = router;