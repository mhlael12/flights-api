const { Duffel } = require('@duffel/api');

// تهيئة المكتبة باستخدام التوكن من ملف .env
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN
});

// تصدير كائن duffel ليتمكن الكنترولر من استخدامه في الحجز
exports.duffel = duffel;

/**
 * @desc    البحث عن عروض رحلات الطيران
 */
exports.searchFlights = async (origin, destination, departureDate) => {
  try {
    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin,
          destination,
          departure_date: departureDate,
        },
      ],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy',
    });

    // تأكد من وجود بيانات قبل البدء في المعالجة
    if (!offerRequest.data || !offerRequest.data.offers) {
        return [];
    }

    // استخدمنا ?. لضمان عدم توقف الكود إذا كان الحقل غير موجود
    return offerRequest.data.offers.map(offer => ({
      id: offer.id,
      airline: offer.owner?.name || 'Unknown Airline',
      price: offer.total_amount,
      currency: offer.total_currency,
      logo: offer.owner?.logo_symbol_url || '',
      passenger_ids: offer.passengers?.map(p => p.id) || []
    }));

  } catch (error) {
    console.error("Duffel Error Detail:", error.message);
    throw error;
  }
};