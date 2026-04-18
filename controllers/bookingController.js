const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const flightService = require('../services/flightService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const duffel = flightService.duffel;

/**
 * @desc    Generate professional English PDF ticket with Logos
 */
const generateEnglishTicketPDF = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const fileName = `ticket-${data.bookingReference}.pdf`;
            const tempDir = path.join(process.cwd(), 'temp');
            const filePath = path.join(tempDir, fileName);

            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- LOGOS SECTION ---
            // تأكد من وضع صورة flygenie.png داخل مجلد اسمه assets في المجلد الرئيسي
            const logoPath = path.join(process.cwd(), 'assets', 'flygenie.png');
            
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 450, 30, { width: 100 });
            } else {
                doc.fontSize(20).fillColor('#2c3e50').text('FLY GENIE', 450, 30);
            }

            doc.fontSize(10).fillColor('#7f8c8d').text('Official E-Ticket Receipt', 30, 35);
            doc.moveDown(4);

            // --- CONTENT ---
            doc.fontSize(26).fillColor('#2c3e50').text('FLIGHT TICKET', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).fillColor('black');
            doc.text(`Passenger Name: ${data.userName}`);
            doc.text(`Issue Date: ${new Date().toLocaleDateString()}`);
            doc.moveDown();

            // Flight Details Box
            const boxTop = doc.y;
            doc.rect(30, boxTop, 535, 100).lineWidth(1).strokeColor('#bdc3c7').stroke();
            
            doc.font('Helvetica-Bold').text('FLIGHT INFORMATION', 40, boxTop + 15);
            doc.font('Helvetica').fontSize(11);
            doc.text(`Booking Reference (PNR): ${data.bookingReference}`, 40, boxTop + 40);
            doc.text(`Destination: ${data.destination}`, 40, boxTop + 60);
            
            doc.fontSize(16).fillColor('#27ae60').text(`TOTAL: ${data.price}`, 400, boxTop + 45, { align: 'right', width: 150 });

            doc.moveDown(6);
            doc.fontSize(10).fillColor('#7f8c8d').text('Thank you for choosing Fly Genie. Have a safe flight!', { align: 'center' });

            doc.end();
            stream.on('finish', () => resolve(filePath));
        } catch (err) {
            reject(err);
        }
    });
};

// @desc      Create a new booking
exports.createBooking = asyncHandler(async (req, res, next) => {
    const { offer_id, passengers, flight: localFlightId, seatsBooked, total_amount, total_currency } = req.body;
    let bookingData = { user: req.user.id };
    let flightDetails = {
        userName: req.user.name,
        destination: 'International Flight',
        bookingReference: '',
        price: ''
    };

    // 1. Handle Duffel Booking
    if (offer_id) {
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
                payments: [{ amount: total_amount, currency: total_currency, type: "balance" }],
                type: 'instant'
            });

            const orderData = order.data ? order.data : order;
            bookingData.duffelOrderId = orderData.id;
            bookingData.bookingReference = orderData.booking_reference;
            
            flightDetails.bookingReference = orderData.booking_reference;
            flightDetails.price = `${orderData.total_amount} ${orderData.total_currency}`;
        } catch (error) {
            return next(new ErrorResponse(`Duffel Error: ${error.message}`, 500));
        }
    } 
    // 2. Handle Local Flight
    else if (localFlightId) {
        const flight = await Flight.findById(localFlightId);
        if (!flight) return next(new ErrorResponse('Flight not found', 404));

        flight.availableSeats -= (seatsBooked || 1);
        await flight.save();

        const localRef = Math.random().toString(36).substring(7).toUpperCase();
        bookingData.flight = localFlightId;
        bookingData.bookingReference = localRef;

        flightDetails.bookingReference = localRef;
        flightDetails.destination = flight.destination;
        flightDetails.price = `${flight.price} USD`;
    }

    // 3. Save to Database (هنا قمت بتعريف المتغير بشكل صحيح)
    const booking = await Booking.create(bookingData);

    // 4. PDF Generation
    let pdfPath;
    try {
        pdfPath = await generateEnglishTicketPDF(flightDetails);
    } catch (err) {
        console.error('PDF Error:', err.message);
    }

    // 5. Send Confirmation Email
    try {
        await sendEmail({
            email: req.user.email,
            subject: 'Your Fly Genie Ticket',
            html: `<h3>Booking Confirmed!</h3><p>Dear ${req.user.name}, your ticket is attached below.</p>`,
            attachments: pdfPath ? [{ filename: `Ticket-${flightDetails.bookingReference}.pdf`, path: pdfPath }] : []
        });
    } catch (err) {
        console.error('Email Send Error:', err.message);
    }

    // 6. Final Response
    res.status(201).json({ 
        success: true, 
        data: booking // الآن لن يظهر خطأ booking is not defined
    });
});

exports.getMyBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id }).populate('flight');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});