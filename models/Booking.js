const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    flight: {
        type: mongoose.Schema.ObjectId,
        ref: 'Flight', // ربط مع موديل الرحلات
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // ربط مع موديل المستخدمين
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
        default: 'confirmed' // بما أننا لم نربط الدفع بعد، سنجعله مؤكداً تلقائياً
    },
});

module.exports = mongoose.model('Booking', BookingSchema);