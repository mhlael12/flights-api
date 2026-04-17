const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { searchFlights: searchDuffelFlights } = require('../services/flightService');

// @desc     البحث عن رحلات (هجين: محلي + Duffel)
// @route    GET /api/v1/flights/search
exports.searchFlights = asyncHandler(async (req, res, next) => {
    const { origin, destination, date, minPrice, maxPrice } = req.query;

    // --- الحالة الأولى: البحث الدولي عبر Duffel ---
    if (origin && destination && date) {
        const realOffers = await searchDuffelFlights(origin, destination, date);
        
        // ✅ التعديل هنا: نرسل realOffers مباشرة لأننا قمنا بتشكيلها في الـ Service
        return res.status(200).json({
            success: true,
            source: 'Duffel Real-time API',
            count: realOffers.length,
            data: realOffers // لم نعد بحاجة لـ .map هنا
        });
    }

    // --- الحالة الثانية: البحث المحلي في قاعدة البيانات ---
    let query = {};
    if (destination) query.destination = new RegExp(destination, 'i');
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const localFlights = await Flight.find(query);
    res.status(200).json({ 
        success: true, 
        source: 'Local Database',
        count: localFlights.length, 
        data: localFlights 
    });
});

// 1. جلب كل الرحلات المحلية
exports.getAllFlights = asyncHandler(async (req, res, next) => {
    const flights = await Flight.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: flights.length, data: flights });
});

// 2. جلب رحلة واحدة بواسطة ID
exports.getFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return next(new ErrorResponse(`لا توجد رحلة بهذا الرقم ${req.params.id}`, 404));
    res.status(200).json({ success: true, data: flight });
});

// 3. إضافة رحلة جديدة
exports.addFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, data: flight });
});

// 4. تحديث بيانات رحلة
exports.updateFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!flight) return next(new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404));
    res.status(200).json({ success: true, data: flight });
});

// 5. حذف رحلة
exports.deleteFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return next(new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404));
    res.status(200).json({ success: true, message: "Flight deleted successfully" });
});