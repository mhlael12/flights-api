const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc     إنشاء حجز جديد
// @route    POST /api/bookings
exports.createBooking = asyncHandler(async (req, res, next) => {
    // 1. إضافة معرف المستخدم للطلب
    req.body.user = req.user.id;

    // 2. جلب بيانات الرحلة أولاً (مهم جداً قبل تجهيز الإيميل)
    const flight = await Flight.findById(req.body.flight);

    if (!flight) {
        return next(new ErrorResponse('الرحلة غير موجودة', 404));
    }

    // 3. التأكد من توفر المقاعد
    if (flight.availableSeats < req.body.seatsBooked) {
        return next(new ErrorResponse('عذراً، لا يوجد مقاعد كافية', 400));
    }

    // 4. إنشاء الحجز في قاعدة البيانات
    const booking = await Booking.create(req.body);

    // 5. تحديث عدد المقاعد المتاحة
    flight.availableSeats -= req.body.seatsBooked;
    await flight.save();

    // 6. الآن نجهز قالب الإيميل بعد أن أصبح متغير flight جاهزاً وموجوداً
    const logoUrl = 'https://i.ibb.co/wZ5p42FN/flygenie.png'; 
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; max-width: 600px; direction: rtl; text-align: right;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Fly Genie Logo" style="width: 150px;">
            <h1 style="color: #2c3e50;">تأكيد حجز رحلتك</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px;">
            <p>مرحباً <strong>${req.user.name}</strong>،</p>
            <p>يسعدنا إبلاغك بأن حجزك قد تم بنجاح. إليك تفاصيل التذكرة:</p>
            <hr>
            <table style="width: 100%;">
                <tr>
                    <td><strong>رقم الرحلة:</strong></td>
                    <td>${flight.flightNumber}</td>
                </tr>
                <tr>
                    <td><strong>الوجهة:</strong></td>
                    <td>${flight.destination}</td>
                </tr>
                <tr>
                    <td><strong>السعر:</strong></td>
                    <td>${flight.price} $</td>
                </tr>
            </table>
        </div>
    
        <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 12px;">
            <p>شكراً لاختيارك فلاي جيني - نتمنى لك رحلة سعيدة!</p>
        </div>
    </div>
    `;

    // 7. إرسال الإيميل
    try {
        await sendEmail({
            email: req.user.email,
            subject: 'تأكيد حجز رحلتك - Fly Genie',
            html: htmlMessage 
        }); // هنا كان ينقص إغلاق القوس
    } catch (err) {
        console.log('Email could not be sent:', err);
    }

    res.status(201).json({ success: true, data: booking });
});

// @desc     جلب حجوزات المستخدم الحالي
// @route    GET /api/bookings/my-bookings
exports.getMyBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).populate('flight');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});