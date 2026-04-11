const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    إنشاء حجز جديد
// @route   POST /api/bookings
exports.createBooking = asyncHandler(async (req, res, next) => {
    // إضافة معرف المستخدم الحالي للطلب
    req.body.user = req.user.id;

    const flight = await Flight.findById(req.body.flight);

    if (!flight) {
        return next(new ErrorResponse('الرحلة غير موجودة', 404));
    }

    // التأكد من توفر المقاعد
    if (flight.availableSeats < req.body.seatsBooked) {
        return next(new ErrorResponse('عذراً، لا يوجد مقاعد كافية', 400));
    }

    const booking = await Booking.create(req.body);

    // تحديث عدد المقاعد المتاحة في الرحلة
    flight.availableSeats -= req.body.seatsBooked;
    await flight.save();

    res.status(201).json({ success: true, data: booking });
});

// @desc    جلب حجوزات المستخدم الحالي
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).populate('flight');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});