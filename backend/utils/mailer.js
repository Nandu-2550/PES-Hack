const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const langSubjects = {
  en: (crop) => `New Crop Listed: ${crop}`,
  kn: (crop) => `ಹೊಸ ಬೆಳೆ ಲಿಸ್ಟ್ ಆಗಿದೆ: ${crop}`,
  hi: (crop) => `नई फसल सूचीबद्ध: ${crop}`,
};

const langBody = {
  en: (crop, district, price, seller, phone) =>
    `<p>A new crop <strong>${crop}</strong> has been listed in <strong>${district}</strong> at ₹${price}/kg.</p><p>Contact seller <strong>${seller}</strong> at <strong>${phone}</strong> directly.</p><p>Visit AgriHub to view details.</p>`,
  kn: (crop, district, price, seller, phone) =>
    `<p><strong>${district}</strong> ನಲ್ಲಿ ₹${price}/kg ಬೆಲೆಗೆ ಹೊಸ ಬೆಳೆ <strong>${crop}</strong> ಲಿಸ್ಟ್ ಮಾಡಲಾಗಿದೆ.</p><p>ಮಾರಾಟಗಾರ <strong>${seller}</strong> ಅವರನ್ನು <strong>${phone}</strong> ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.</p>`,
  hi: (crop, district, price, seller, phone) =>
    `<p><strong>${district}</strong> में ₹${price}/kg पर नई फसल <strong>${crop}</strong> सूचीबद्ध हुई है।</p><p>विक्रेता <strong>${seller}</strong> से <strong>${phone}</strong> पर सीधे संपर्क करें।</p>`,
};

/**
 * Send a crop-listed notification email.
 * @param {Object} params
 * @param {string} params.toEmail
 * @param {string} params.toName
 * @param {string} params.lang  - 'en' | 'kn' | 'hi'
 * @param {Object} params.crop  - { cropName, district, pricePerKg, sellerName, sellerContact }
 */
async function sendCropNotification({ toEmail, toName, lang = 'en', crop }) {
  if (!BREVO_API_KEY) {
    console.warn('[Mailer] BREVO_API_KEY not set — skipping email.');
    return;
  }
  try {
    const subject = langSubjects[lang]?.(crop.cropName) ?? langSubjects.en(crop.cropName);
    const htmlContent = langBody[lang]?.(
      crop.cropName, crop.district, crop.pricePerKg, crop.sellerName, crop.sellerContact
    ) ?? langBody.en(crop.cropName, crop.district, crop.pricePerKg, crop.sellerName, crop.sellerContact);

    await axios.post(
      BREVO_URL,
      {
        sender: { name: 'AgriHub', email: 'noreply@agrihub.app' },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[Mailer] Crop notification sent to ${toEmail}`);
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.response?.data || err.message);
  }
}

/**
 * Send a government scheme notification email.
 */
async function sendSchemeNotification({ toEmail, toName, lang = 'en', scheme }) {
  if (!BREVO_API_KEY) return;
  try {
    const subjects = {
      en: `New Government Scheme: ${scheme.title}`,
      kn: `ಹೊಸ ಸರ್ಕಾರಿ ಯೋಜನೆ: ${scheme.title}`,
      hi: `नई सरकारी योजना: ${scheme.title}`,
    };
    const bodies = {
      en: `<p><strong>${scheme.title}</strong></p><p>${scheme.summary}</p><p><a href="${scheme.applicationLink}">Apply Now →</a></p>`,
      kn: `<p><strong>${scheme.title}</strong></p><p>${scheme.summary}</p><p><a href="${scheme.applicationLink}">ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →</a></p>`,
      hi: `<p><strong>${scheme.title}</strong></p><p>${scheme.summary}</p><p><a href="${scheme.applicationLink}">अभी आवेदन करें →</a></p>`,
    };

    await axios.post(
      BREVO_URL,
      {
        sender: { name: 'AgriHub', email: 'noreply@agrihub.app' },
        to: [{ email: toEmail, name: toName }],
        subject: subjects[lang] ?? subjects.en,
        htmlContent: bodies[lang] ?? bodies.en,
      },
      { headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Mailer] Scheme email failed:', err.response?.data || err.message);
  }
}

module.exports = { sendCropNotification, sendSchemeNotification };
