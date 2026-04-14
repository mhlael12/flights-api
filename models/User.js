const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'يرجى إضافة الاسم']
    },
    email: {
        type: String,
        required: [true, 'يرجى إضافة البريد الإلكتروني'],
        unique: true,
        match: [/.+\@.+\..+/, 'يرجى إدخال بريد إلكتروني صحيح']
    },
    // إضافة حقل رقم الهاتف (ضروري لإرسال الـ OTP عبر الواتساب)
    phone: {
        type: String,
        required: [true, 'يرجى إضافة رقم الهاتف'],
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'يرجى إدخال رقم هاتف صحيح بصيغة دولية (مثال: +964...)']
    },
    password: {
        type: String,
        required: [true, 'يرجى إضافة كلمة السر'],
        minlength: 6,
        select: false 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // --- حقول التحقق الجديدة (OTP) ---
    otpCode: {
        type: String,
        select: false // لا نريد أن يظهر الرمز في الطلبات العادية
    },
    otpExpire: {
        type: Date,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false // سيصبح true بعد إدخال الـ OTP بنجاح
    }
}, { timestamps: true });

// تشفير كلمة السر قبل الحفظ
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// وظيفة لإنشاء الـ Token (JWT)
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// التحقق من كلمة السر
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);