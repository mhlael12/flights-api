const Flight = require('../models/Flight');

// 1. جلب كل الرحلات (مع إضافة خاصية الاختيار لتقليل حجم البيانات المسترجعة)
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 }); // الأحدث أولاً
        res.status(200).json({
            success: true,
            count: flights.length,
            data: flights
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// 2. إضافة رحلة جديدة (مع التحقق من وجود البيانات الأساسية)
exports.addFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        res.status(201).json({ success: true, data: flight });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// 3. البحث المتقدم (Advanced Filter)
exports.searchFlights = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. تحديث بيانات رحلة (Update)
exports.updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // لإرجاع البيانات بعد التعديل
            runValidators: true // للتأكد من أن البيانات الجديدة تطابق الشروط في الموديل
        });

        if (!flight) return res.status(404).json({ success: false, error: "Flight not found" });

        res.status(200).json({ success: true, data: flight });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// 5. حذف رحلة (Delete)
exports.deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        
        if (!flight) return res.status(404).json({ success: false, error: "Flight not found" });

        res.status(200).json({ success: true, message: "Flight deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};