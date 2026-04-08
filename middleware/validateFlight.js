const { body, validationResult } = require('express-validator');

const validateFlight = [
    // .trim() تحذف المسافات الزائدة
    // .escape() تحول الرموز مثل < إلى نصوص آمنة لمنع الـ XSS
    body('flightNumber').trim().notEmpty().withMessage('رقم الرحلة مطلوب').escape(),
    body('destination').trim().isLength({ min: 3 }).withMessage('الوجهة يجب أن تكون 3 أحرف على الأقل').escape(),
    body('price').isNumeric().withMessage('السعر يجب أن يكون رقماً'),
    body('airline').trim().notEmpty().withMessage('اسم شركة الطيران مطلوب').escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateFlight };