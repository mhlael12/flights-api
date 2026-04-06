const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { 
        type: String, 
        required: [true, 'رقم الرحلة مطلوب'], 
        unique: true,
        trim: true // لإزالة المسافات الزائدة تلقائياً
    },
    airline: { 
        type: String, 
        required: [true, 'اسم شركة الطيران مطلوب'] 
    },
    destination: { 
        type: String, 
        required: [true, 'الوجهة مطلوبة'] 
    },
    price: { 
        type: Number, 
        required: [true, 'السعر مطلوب'],
        min: [0, 'السعر لا يمكن أن يكون سالباً'] // حماية للبيانات
    },
    status: { 
        type: String, 
        enum: ['Available', 'Delayed', 'Cancelled'], // تحديد الخيارات المتاحة فقط
        default: 'Available' 
    }
}, { 
    timestamps: true // يضيف createdAt و updatedAt تلقائياً
});

module.exports = mongoose.model('Flight', flightSchema);