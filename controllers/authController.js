const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone, role } = req.body;
    const user = await User.create({ name, email, password, phone, role });

    res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول لتلقي رمز التحقق.'
    });
});

// @desc    Login user (Step 1)
exports.login = asyncHandler(async (req, res, next) => { // تأكد من وجود req, res, next هنا
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('يرجى إدخال البريد الإلكتروني وكلمة السر', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return next(new ErrorResponse('بيانات الدخول غير صحيحة', 401));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
        const logoUrl = 'https://i.ibb.co/wZ5p42FN/flygenie.png';
        const htmlMessage = `
        <div style="font-family: Arial; direction: rtl; text-align: center; border: 1px solid #eee; padding: 20px;">
            <img src="${logoUrl}" width="100">
            <h2>رمز التحقق الخاص بـ Fly Genie</h2>
            <p>مرحباً ${user.name}، استخدم الرمز التالي لإتمام عملية تسجيل الدخول:</p>
            <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
            <p>هذا الرمز صالح لمدة 10 دقائق فقط.</p>
        </div>`;

        await sendEmail({
            email: user.email,
            subject: 'رمز التحقق (OTP) - Fly Genie',
            html: htmlMessage
        });

        res.status(200).json({
            success: true,
            message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        });

    } catch (err) {
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save();
        // تأكد أن next هنا تشير إلى المعامل في الأعلى
        return next(new ErrorResponse('فشل إرسال البريد الإلكتروني، حاول لاحقاً', 500));
    }
});

// @desc    Verify OTP (Step 2)
exports.verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorResponse('يرجى إدخال البريد الإلكتروني والرمز', 400));
    }

    const user = await User.findOne({
        email,
        otpCode: otp,
        otpExpire: { $gt: Date.now() }
    }).select('+otpCode +otpExpire');

    if (!user) {
        return next(new ErrorResponse('رمز التحقق غير صحيح أو انتهت صلاحيته', 400));
    }

    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.isVerified = true;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token
    });
});