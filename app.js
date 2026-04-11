require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const flightRoutes = require('./routes/flightRoutes');
const helmet = require('helmet');
const errorHandler = require('./middleware/error'); // استيراد محطة معالجة الأخطاء
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. Middlewares الحماية والأساسيات
app.use(helmet()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

// 3. تعريف المسارات (Routes)
app.use('/api/flights', flightRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', bookingRoutes);

// 4. معالجة المسارات غير الموجودة (404 Not Found)
// ملاحظة: هذا الـ Middleware يبقى قبل الـ Error Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "الرابط المطلوب غير موجود - Route not found"
    });
});
// 5. محطة معالجة الأخطاء المركزية (Global Error Handler)
// هام جداً: يجب أن يكون هذا الـ Middleware في آخر الملف دائماً
app.use(errorHandler);


// 6. التشغيل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});