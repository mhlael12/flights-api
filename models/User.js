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
    }
}, { timestamps: true });

// تشفير كلمة السر قبل الحفظ
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// وظيفة لإنشاء الـ Token (JWT)
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}; // تأكد من إغلاق القوس هنا 

// التحقق من كلمة السر (يجب أن تكون دالة منفصلة)
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);