const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // إنشاء المستخدم
    const user = await User.create({ name, email, password, role });

    // إنشاء الـ Token
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        token
    });
}); // <--- هذا القوس يغلق دالة register بشكل صحيح

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. التحقق من إرسال الإيميل والباسورد
    if (!email || !password) {
        return next(new ErrorResponse('يرجى إدخال البريد الإلكتروني وكلمة السر', 400));
    }

    // 2. البحث عن المستخدم + جلب الباسورد
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('بيانات الدخول غير صحيحة', 401));
    }

    // 3. التحقق من تطابق كلمة السر
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('بيانات الدخول غير صحيحة', 401));
    }

    // 4. إذا كان كل شيء صحيحاً، أرسل الـ Token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token
    });
}); // <--- هذا القوس يغلق دالة login