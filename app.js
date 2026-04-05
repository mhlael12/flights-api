require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Flight = require('./models/Flight');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Fly Genie Cloud"))
  .catch((err) => console.error("Database connection error:", err.message));

app.get('/', (req, res) => {
    res.send('Fly Genie API - System is Running');
});

app.post('/add-flight', async (req, res) => {
    try {
        const newFlight = new Flight(req.body);
        await newFlight.save();
        res.status(201).json({ message: "Flight saved successfully", flight: newFlight });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/all-flights', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.status(200).json(flights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});