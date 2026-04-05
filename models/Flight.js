const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    destination: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'Available' }
});

module.exports = mongoose.model('Flight', flightSchema);