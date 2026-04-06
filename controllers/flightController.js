const Flight = require('../models/Flight');

// 1. جلب كل الرحلات
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find();
        res.status(200).json(flights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. إضافة رحلة جديدة
exports.addFlight = async (req, res) => {
    try {
        const newFlight = new Flight(req.body);
        await newFlight.save();
        res.status(201).json({ message: "Flight saved", flight: newFlight });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 3. البحث عن رحلة بواسطة الوجهة (نسخة واحدة فقط تكفي)
exports.searchFlights = async (req, res) => {
    try {
        const { destination } = req.query; 
        const flights = await Flight.find({ 
            destination: new RegExp(destination, 'i') 
        });
        res.status(200).json(flights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};