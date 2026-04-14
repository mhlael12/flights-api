const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// 1. حماية الروابط (التأكد من وجود Token وصلاحيته)
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // التحقق من وجود التوكين في الـ Headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // التأكد من أن التوكين موجود
    if (!token) {
        return next(new ErrorResponse('غير مسموح لك بالدخول، يرجى تسجيل الدخول أولاً', 401));
    }

    try {
        // التحقق من صحة التوكين
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // جلب بيانات المستخدم وإرفاقها بالطلب
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('المستخدم صاحب هذا التوكين لم يعد موجوداً', 404));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('رمز الدخول غير صالح أو منتهي الصلاحية', 401));
    }
});

// 2. تحديد الصلاحيات بناءً على الأدوار (Roles)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // التأكد من أن الدور الخاص بالمستخدم موجود ضمن الأدوار المسموح لها
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(`المستخدم برتبة (${req.user ? req.user.role : 'guest'}) غير مسموح له بالقيام بهذا الإجراء`, 403)
            );
        }
        next();
    };
};