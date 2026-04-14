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

// 4. تحويل المسارات غير الموجودة إلى خطأ 404 ليتم معالجته مركزياً
app.use((req, res, next) => {
    // بدلاً من إرسال res هنا، نرسل خطأ إلى next
    const error = new ErrorResponse(`الرابط المطلوب غير موجود - ${req.originalUrl}`, 404);
    next(error); 
});

// 5. محطة معالجة الأخطاء المركزية (Global Error Handler)
// الآن سيستقبل هذا الميدل وير كل الأخطاء سواء 404 أو 500 القادمة من Login
app.use(errorHandler);
// 6. التشغيل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});