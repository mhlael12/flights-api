const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// 1. حماية الروابط (التأكد من وجود Token وصلاحيته)
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('غير مسموح لك بالدخول إلى هذا الرابط', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('رمز الدخول غير صالح أو منتهي الصلاحية', 401));
    }
}); //

// 2. تحديد الصلاحيات بناءً على الأدوار (Roles)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(`المستخدم برتبة (${req.user?.role || 'unknown'}) غير مسموح له بالقيام بهذا الإجراء`, 403)
            );
        }
        next();
    };
}; //