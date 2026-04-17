const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    // تم إزالة required: true لجعل الحقل اختيارياً (للحجوزات المحلية فقط)
    flight: {
        type: mongoose.Schema.ObjectId,
        ref: 'Flight',
        required: false 
    },
    // حقل جديد لتخزين رقم الطلب القادم من Duffel (للحجوزات الدولية)
    duffelOrderId: {
        type: String,
        required: false
    },
    // حقل لتخزين رقم الحجز الرسمي الذي يعطيه Duffel (Booking Reference)
    bookingReference: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    seatsBooked: {
        type: Number,
        default: 1,
        min: [1, 'يجب حجز مقعد واحد على الأقل']
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'confirmed'
    },
});

module.exports = mongoose.model('Booking', BookingSchema);