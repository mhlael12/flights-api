const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const flightService = require('../services/flightService');

const duffel = flightService.duffel;

// @desc      إنشاء حجز جديد (دولي أو محلي)
// @route     POST /api/v1/bookings
exports.createBooking = asyncHandler(async (req, res, next) => {
    const { offer_id, passengers, flight: localFlightId, seatsBooked, total_amount, total_currency } = req.body;
    let bookingData = { user: req.user.id };
    let flightDetails = {};

    // --- أولاً: التعامل مع الحجز الدولي (Duffel) ---
    if (offer_id) {
        if (!total_amount || !total_currency) {
            return next(new ErrorResponse('يرجى تزويد السعر (total_amount) والعملة (total_currency) لإتمام الحجز الدولي', 400));
        }

        try {
            const order = await duffel.orders.create({
                selected_offers: [offer_id],
                passengers: passengers.map(p => ({
                    id: p.id,
                    type: 'adult',
                    given_name: p.given_name,
                    family_name: p.family_name,
                    gender: p.gender,
                    title: p.title,
                    born_on: p.born_on,
                    email: p.email,
                    phone_number: p.phone_number,
                    identity_documents: [{
                        unique_identifier: p.passport_number,
                        type: 'passport',
                        issuing_country_code: p.passport_country,
                        expires_on: p.passport_expiry
                    }]
                })),
                payments: [{
                    amount: total_amount,
                    currency: total_currency,
                    type: "balance"
                }],
                type: 'instant'
            });

            // تخزين بيانات Duffel في قاعدة بياناتنا
            const orderData = order.data ? order.data : order;
            bookingData.duffelOrderId = order.id;
            bookingData.bookingReference = order.booking_reference;
            
            // تعبئة البيانات للإيميل والرد
            flightDetails = {
                flightNumber: order.booking_reference,
                destination: 'رحلة دولية (International Flight)',
                price: `${order.total_amount} ${order.total_currency}`
            };
        } catch (error) {
            console.log("Duffel API Error Details:", JSON.stringify(error.errors, null, 2));
            return next(new ErrorResponse(`فشل حجز Duffel: ${error.message}`, 500));
        }
    } 
    // --- ثانياً: التعامل مع الحجز المحلي (قاعدة البيانات) ---
    else if (localFlightId) {
        const flight = await Flight.findById(localFlightId);
        if (!flight) return next(new ErrorResponse('الرحلة المحلية غير موجودة', 404));
        if (flight.availableSeats < seatsBooked) return next(new ErrorResponse('عذراً، لا توجد مقاعد كافية', 400));

        flight.availableSeats -= seatsBooked;
        await flight.save();

        bookingData.flight = localFlightId;
        bookingData.seatsBooked = seatsBooked;
        
        flightDetails = {
            flightNumber: flight.flightNumber,
            destination: flight.destination,
            price: `${flight.price} $`
        };
    } else {
        return next(new ErrorResponse('يرجى تقديم offer_id أو معرف رحلة محلي', 400));
    }

    // إنشاء السجل في قاعدة البيانات
    const booking = await Booking.create(bookingData);

    // --- ثالثاً: إرسال بريد التأكيد ---
    const logoUrl = 'https://i.ibb.co/wZ5p42FN/flygenie.png';
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; max-width: 600px; direction: rtl; text-align: right;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Fly Genie Logo" style="width: 150px;">
            <h1 style="color: #2c3e50;">تأكيد حجز رحلتك</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px;">
            <p>مرحباً <strong>${req.user.name}</strong>،</p>
            <p>تم الحجز بنجاح عبر <strong>Fly Genie</strong>. تفاصيل التذكرة:</p>
            <hr>
            <table style="width: 100%;"><tr><td><strong>رقم الحجز:</strong></td><td>${flightDetails.flightNumber || 'جاري المعالجة...'}</td></tr>
            <tr><td><strong>الوجهة:</strong></td><td>${flightDetails.destination || 'رحلة دولية'}</td></tr>
            <tr><td><strong>الإجمالي:</strong></td><td>${flightDetails.price || 'مدفوع'}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">شكراً لاختيارك فلاي جيني!</p>
        </div>
    </div>`;

    try {
        await sendEmail({
            email: req.user.email,
            subject: 'تأكيد حجز رحلتك - Fly Genie',
            html: htmlMessage
        });
    } catch (err) {
        console.log('Email error:', err.message);
    }

    res.status(201).json({ success: true, data: booking });
});

// @desc      جلب حجوزاتي
// @route     GET /api/v1/bookings/my
exports.getMyBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).populate('flight');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});