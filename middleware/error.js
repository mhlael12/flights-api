const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // سجل الخطأ للمبرمج في الـ Console
    console.log(err.stack);

    // 1. خطأ Mongoose: إذا كان الـ ID غير صحيح (CastError)
    if (err.name === 'CastError') {
        const message = `الرقم التعريفي غير موجود - Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // 2. خطأ Mongoose: تكرار قيمة فريدة (مثل flightNumber)
    if (err.code === 11000) {
        const message = 'قيمة مكررة: هذا العنصر موجود مسبقاً في قاعدة البيانات';
        error = new ErrorResponse(message, 400);
    }

    // 3. خطأ Mongoose: فشل التحقق (ValidationError)
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'خطأ في السيرفر - Server Error'
    });
};

module.exports = errorHandler;