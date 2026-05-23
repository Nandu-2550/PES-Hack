const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * sendEmail()
 *
 * Exposes a generic SDK mailer dispatch wrapper.
 */
async function sendEmail({ to, toName, subject, htmlContent, textContent }) {
  if (!process.env.BREVO_API_KEY) {
    console.warn('[Mailer] BREVO_API_KEY not configured — skipping email dispatch.');
    return { success: false, error: 'API key not configured' };
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL || 'nandunusgavai@gmail.com',
    name: process.env.BREVO_SENDER_NAME || 'AgriShield'
  };

  sendSmtpEmail.to = [{ email: to, name: toName || to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  if (textContent) sendSmtpEmail.textContent = textContent;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('[Mailer] Email successfully dispatched via Brevo SDK:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Mailer] Brevo SDK email error details:', error.response?.text || error.message);
    throw error;
  }
}

const langSubjects = {
  en: (crop) => `New Crop Listed: ${crop}`,
  kn: (crop) => `ಹೊಸ ಬೆಳೆ ಲಿಸ್ಟ್ ಆಗಿದೆ: ${crop}`,
  hi: (crop) => `नई फसल सूचीबद्ध: ${crop}`,
};

const langBody = {
  en: (crop, district, price, seller, phone) =>
    `<p>A new crop <strong>${crop}</strong> has been listed in <strong>${district}</strong> at ₹${price}/kg.</p><p>Contact seller <strong>${seller}</strong> at <strong>${phone}</strong> directly.</p><p>Visit AgriShield to view details.</p>`,
  kn: (crop, district, price, seller, phone) =>
    `<p><strong>${district}</strong> ನಲ್ಲಿ ₹${price}/kg ಬೆಲೆಗೆ ಹೊಸ ಬೆಳೆ <strong>${crop}</strong> ಲಿಸ್ಟ್ ಮಾಡಲಾಗಿದೆ.</p><p>ಮಾರಾಟಗಾರ <strong>${seller}</strong> ಅವರನ್ನು <strong>${phone}</strong> ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.</p>`,
  hi: (crop, district, price, seller, phone) =>
    `<p><strong>${district}</strong> में ₹${price}/kg पर नई फसल <strong>${crop}</strong> सूचीबद्ध हुई है।</p><p>विक्रेता <strong>${seller}</strong> से <strong>${phone}</strong> पर सीधे संपर्क करें।</p>`,
};

/**
 * sendCropNotification()
 *
 * Triggers regional dispatches when a crop is listed in the district.
 */
async function sendCropNotification({ toEmail, toName, lang = 'en', crop }) {
  try {
    const subject = langSubjects[lang]?.(crop.cropName) ?? langSubjects.en(crop.cropName);
    const htmlContent = langBody[lang]?.(
      crop.cropName, crop.district, crop.pricePerKg, crop.sellerName, crop.sellerContact
    ) ?? langBody.en(crop.cropName, crop.district, crop.pricePerKg, crop.sellerName, crop.sellerContact);

    return await sendEmail({ to: toEmail, toName, subject, htmlContent });
  } catch (err) {
    console.error('[Mailer] Crop regional dispatch failed:', err.message);
  }
}

/**
 * sendSchemeNotification()
 *
 * Triggers dispatch when a government scheme is announced.
 */
async function sendSchemeNotification({ toEmail, toName, lang = 'en', scheme }) {
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

    return await sendEmail({
      to: toEmail,
      toName,
      subject: subjects[lang] ?? subjects.en,
      htmlContent: bodies[lang] ?? bodies.en
    });
  } catch (err) {
    console.error('[Mailer] Scheme broadcast failed:', err.message);
  }
}

module.exports = { sendEmail, sendCropNotification, sendSchemeNotification };
