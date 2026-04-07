require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const flightRoutes = require('./routes/flightRoutes');

const app = express();

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. Middlewares الأساسية
app.use(express.json()); // لتحليل بيانات JSON القادمة في الـ Body
app.use(express.urlencoded({ extended: false })); // لدعم بيانات Form-data إذا احتجت مستقبلاً

// 3. تعريف المسارات (Routes)
app.use('/api/flights', flightRoutes);

// 4. معالجة المسارات غير الموجودة (404 Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "الرابط المطلوب غير موجود - Route not found"
    });
});

// 5. التشغيل على المنفذ المخصص
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});