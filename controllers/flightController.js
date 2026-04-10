const Flight = require('../models/Flight');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// 1. جلب كل الرحلات
// لاحظ كيف تخلصنا من try...catch تماماً
exports.getAllFlights = asyncHandler(async (req, res, next) => {
    const flights = await Flight.find().sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: flights.length,
        data: flights
    });
});

// 2. إضافة رحلة جديدة
exports.addFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, data: flight });
});

// 3. البحث المتقدم
exports.searchFlights = asyncHandler(async (req, res, next) => {
    const { destination, minPrice, maxPrice } = req.query;
    let query = {};

    if (destination) query.destination = new RegExp(destination, 'i');
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const flights = await Flight.find(query);
    res.status(200).json({ success: true, data: flights });
});

// 4. تحديث بيانات رحلة
exports.updateFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!flight) {
        // نستخدم next(new ErrorResponse) بدلاً من return res.status(404)
        return next(new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: flight });
});

// 5. حذف رحلة
exports.deleteFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    
    if (!flight) {
        return next(new ErrorResponse(`Flight not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, message: "Flight deleted successfully" });
});
// جلب رحلة واحدة بواسطة ID
exports.getFlight = asyncHandler(async (req, res, next) => {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
        return next(new ErrorResponse(`لا توجد رحلة بهذا الرقم ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: flight });
});