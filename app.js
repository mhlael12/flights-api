require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const flightRoutes = require('./routes/flightRoutes');
const helmet = require('helmet');

const app = express();

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. Middlewares الحماية والأساسيات
app.use(helmet()); // حماية الـ Headers (متوافقة وسليمة)
app.use(express.json()); // تحليل بيانات JSON 
app.use(express.urlencoded({ extended: false })); 

// ملاحظة: قمنا بإزالة mongoSanitize لأنها تسبب تعارضاً مع النسخة الحالية لديك
// وسنعتمد على express-validator في الـ Middleware الخاص بنا للتنظيف

// 3. تعريف المسارات (Routes)
app.use('/api/flights', flightRoutes);

// 4. معالجة المسارات غير الموجودة (404 Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "الرابط المطلوب غير موجود - Route not found"
    });
});

// 5. التشغيل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});