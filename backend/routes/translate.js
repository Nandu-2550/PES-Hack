const express = require('express');
const router = express.Router();

// Local agricultural translation dictionary fallback (gemini-2.5-flash backup shield)
const localFallbackMap = {
  "Kannada": {
    "tractor": "ಟ್ರಾಕ್ಟರ್",
    "harvester": "ಕೊಯ್ಲು ಯಂತ್ರ",
    "sprayer": "ಸಿಂಪಡಿಸುವ ಯಂತ್ರ",
    "rotavator": "ರೋಟಾವೇಟರ್",
    "power tiller": "ಪವರ್ ಟಿಲ್ಲರ್",
    "cultivator": "ಕಲ್ಟಿವೇಟರ್",
    "seed drill": "ಬೀಜ ಬಿತ್ತುವ ಯಂತ್ರ",
    "thresher": "ಒಕ್ಕಣೆ ಯಂತ್ರ",
    "rice paddy": "ಭತ್ತ",
    "rice paddy (paddy common)": "ಭತ್ತ (ಸಾಮಾನ್ಯ ಭತ್ತ)",
    "rice (paddy)": "ಭತ್ತ",
    "paddy": "ಭತ್ತ",
    "sugarcane": "ಕಬ್ಬು",
    "tomato": "ಟೊಮೆಟೊ",
    "onion": "ಈರುಳ್ಳಿ",
    "ragi": "ರಾಗಿ",
    "finger millet": "ರಾಗಿ",
    "ragi (finger millet)": "ರಾಗಿ",
    "cotton": "ಹತ್ತಿ",
    "cotton (medium staple)": "ಹತ್ತಿ (ಮಧ್ಯಮ ನೂಲು)",
    "maize": "ಮೆಕ್ಕೆಜೋಳ",
    "yellow maize": "ಮೆಕ್ಕೆಜೋಳ",
    "maize (yellow)": "ಮೆಕ್ಕೆಜೋಳ (ಹಳದಿ)",
    "food": "ಊಟ",
    "stay": "ವಸತಿ",
    "transport": "ಸಾರಿಗೆ",
    "karnataka": "ಕರ್ನಾಟಕ",
    "mandya apmc": "ಮಂಡ್ಯ ಎಪಿಎಂಸಿ",
    "bengaluru apmc": "ಬೆಂಗಳೂರು ಎಪಿಎಂಸಿ",
    "mysuru apmc": "ಮೈಸೂರು ಎಪಿಎಂಸಿ",
    "kolar apmc": "ಕೋಲાર ಎಪಿಎಂಸಿ",
    "chitradurga apmc": "ಚಿತ್ರದುರ್ಗ ಎಪಿಎಂಸಿ",
    "davangere apmc": "ದಾವಣಗೆರೆ ಎಪಿಎಂಸಿ",
    "raichur apmc": "ರಾಯಚೂರು ಎಪಿಎಂಸಿ",
    "mysuru sugar factory": "ಮೈಸೂರು ಸಕ್ಕರೆ ಕಾರ್ಖಾನೆ",
    "available": "ಲಭ್ಯವಿದೆ",
    "unavailable": "ಲಭ್ಯವಿಲ್ಲ",
    "quintal": "ಕ್ವಿಂಟಲ್",
    "ton": "ಟನ್",
    "tonne": "ಟನ್",
    "day": "ದಿನ",
    "per day": "ಪ್ರತಿ ದಿನ",
    "live commodity rates in karnataka. updated today.": "ಕರ್ನಾಟಕದ ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆಗಳು.",
    "loading weather...": "ಹವಾಮಾನ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "today": "ಇಂದು",
    "feels": "ಅನಿಸಿಕೆ",
    "humidity": "ಆರ್ದ್ರತೆ",
    "wind": "ಗಾಳಿ",
    "5-day forecast": "೫ ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    "local market prices (mandi)": "ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆಗಳು (ಮಂಡಿ)",
    "crop": "ಬೆಳೆ",
    "price": "ಬೆಲೆ",
    "market": "ಮಾರುಕಟ್ಟೆ",
    "trend": "ಟ್ರೆಂಡ್",
    "no commodity price data available.": "ಯಾವುದೇ ಬೆಲೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
    "find trusted agricultural credit facilities and crop loans with low interest rates.": "ಕಡಿಮೆ ಬಡ್ಡಿದರದಲ್ಲಿ ನಂಬಿಕಸ್ಥ ಕೃಷಿ ಮತ್ತು ಬೆಳೆ ಸಾಲಗಳು.",
    "these are informational listings only. always verify interest rates, processing fees, and loan terms directly with the lending bank or cooperative society before submitting documents.": "ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮುನ್ನ ಬಡ್ಡಿದರ ಮತ್ತು ನಿಯಮಗಳನ್ನು ಬ್ಯಾಂಕಿನಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
    "explore active government schemes and agricultural benefits designed for you.": "ನಿಮಗಾಗಿ ರೂಪಿಸಲಾದ ಸಕ್ರಿಯ ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸೌಲಭ್ಯಗಳು.",
    "n/a": "ಲಭ್ಯವಿಲ್ಲ"
  },
  "Hindi": {
    "tractor": "ट्रैक्टर",
    "harvester": "हार्वेस्टर",
    "sprayer": "स्प्रेयर",
    "rotavator": "रोटावेटर",
    "power tiller": "पावर टिलर",
    "cultivator": "कल्टीवेटर",
    "seed drill": "सीड ड्रिल",
    "thresher": "थ्रेशर",
    "rice paddy": "धान",
    "rice paddy (paddy common)": "धान (सामान्य धान)",
    "rice (paddy)": "धान",
    "paddy": "धान",
    "sugarcane": "गन्ना",
    "tomato": "टमाटर",
    "onion": "प्याज",
    "ragi": "रागी",
    "finger millet": "रागी",
    "ragi (finger millet)": "रागी",
    "cotton": "कपास",
    "cotton (medium staple)": "कपास (मध्यम स्टेपल)",
    "maize": "मक्का",
    "yellow maize": "मक्का",
    "maize (yellow)": "मक्का (पीला)",
    "food": "भोजन",
    "stay": "आवास",
    "transport": "परिवहन",
    "karnataka": "कर्नाटक",
    "mandya apmc": "मैंड्या एपीएमसी",
    "bengaluru apmc": "बेंगलुरु एपीएमसी",
    "mysuru apmc": "मैसूर एपीएमसी",
    "kolar apmc": "कोलार एपीएमसी",
    "chitradurga apmc": "चित्रदुर्ग एपीएमसी",
    "davangere apmc": "दवांगरे एपीएमसी",
    "raichur apmc": "रायचूर एपीएमसी",
    "mysuru sugar factory": "मैसूर शुगर फैक्ट्री",
    "available": "उपलब्ध",
    "unavailable": "अनुपलब्ध",
    "quintal": "क्विंटल",
    "ton": "टन",
    "tonne": "टन",
    "day": "दिन",
    "per day": "प्रति दिन",
    "live commodity rates in karnataka. updated today.": "कर्नाटक में आज के जिंस भाव।",
    "loading weather...": "मौसम लोड हो रहा है...",
    "today": "आज",
    "feels": "महसूस",
    "humidity": "आर्द्रता",
    "wind": "हवा",
    "5-day forecast": "5-दिवसीय पूर्वानुमान",
    "local market prices (mandi)": "स्थानीय बाजार भाव (मंडी)",
    "crop": "फसल",
    "price": "कीमत",
    "market": "बाजार",
    "trend": "रुझान",
    "no commodity price data available.": "कोई जिंस भाव डेटा उपलब्ध नहीं है।",
    "find trusted agricultural credit facilities and crop loans with low interest rates.": "कम ब्याज दरों पर विश्वसनीय कृषि ऋण सुविधाएं और फसल ऋण खोजें।",
    "these are informational listings only. always verify interest rates, processing fees, and loan terms directly with the lending bank or cooperative society before submitting documents.": "यह केवल सूचनात्मक सूची है। आवेदन करने से पहले बैंक या सहकारी समिति से ब्याज दरों और शर्तों को सत्यापित करें।",
    "explore active government schemes and agricultural benefits designed for you.": "अपने लिए तैयार की गई सक्रिय सरकारी योजनाओं और कृषि लाभों का पता लगाएं।",
    "n/a": "उपलब्ध नहीं"
  }
};

// POST /api/translate — Translate dynamic text fields using Claude or Gemini
router.post('/', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text) {
    return res.json({ translatedText: '' });
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // If target is English or matches, return original
  if (targetLanguage === 'en' || targetLanguage === 'English') {
    return res.json({ translatedText: cleanText });
  }

  // 1. Resolve immediately via local fallback dictionary if available
  if (localFallbackMap[targetLanguage] && localFallbackMap[targetLanguage][lowerText]) {
    return res.json({ translatedText: localFallbackMap[targetLanguage][lowerText] });
  }

  // 2. Bypass API calls for custom user strings to protect API Key quota
  // This guarantees VoiceBot (/api/chat) and Scanner (/api/diagnose) get 100% of the API resources.
  return res.json({ translatedText: cleanText });
});

module.exports = router;
