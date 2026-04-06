require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const flightRoutes = require('./routes/flightRoutes');

const app = express();
connectDB(); // الاتصال بقاعدة البيانات

app.use(express.json());

// استخدام المسارات
app.use('/api/flights', flightRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));