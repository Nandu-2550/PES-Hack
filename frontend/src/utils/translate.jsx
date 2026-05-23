import React, { useState, useEffect } from "react";
import client from "../api/client";
import { useLanguage } from "../context/LanguageContext";

// High-fidelity client-side lookup dictionary to resolve common agricultural words instantly.
// This completely resolves API rate limit storms (429 errors) on concurrent card renders.
const localFallbackMap = {
  kn: {
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
    "kolar apmc": "ಕೋಲಾರ ಎಪಿಎಂಸಿ",
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
    "explore active government schemes and agricultural benefits designed for you. ": "ನಿಮಗಾಗಿ ರೂಪಿಸಲಾದ ಸಕ್ರಿಯ ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸೌಲಭ್ಯಗಳು.",
    "n/a": "ಲಭ್ಯವಿಲ್ಲ"
  },
  hi: {
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
    "explore active government schemes and agricultural benefits designed for you. ": "अपने लिए तैयार की गई सक्रिय सरकारी योजनाओं और कृषि लाभों का पता लगाएं।",
    "n/a": "उपलब्ध नहीं"
  }
};

/**
 * Dynamically translates a piece of text to the target language by querying the backend translation API.
 * @param {string} text - The input text to translate.
 * @param {string} targetLanguage - The language code (e.g. 'kn', 'hi', 'en').
 * @returns {Promise<string>} The translated text, or original text if translation fails or is English.
 */
export async function translateText(text, targetLanguage) {
  if (!text || !targetLanguage || targetLanguage === "en") {
    return text;
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Resolve immediately via high-fidelity local fallback map if available
  if (localFallbackMap[targetLanguage] && localFallbackMap[targetLanguage][lowerText]) {
    return localFallbackMap[targetLanguage][lowerText];
  }

  // 2. Query Gemini API via Express translator route
  const langNames = {
    kn: "Kannada",
    hi: "Hindi",
    en: "English"
  };

  const target = langNames[targetLanguage] || targetLanguage;

  try {
    const response = await client.post("/api/translate", {
      text: cleanText,
      targetLanguage: target,
    });
    return response.data?.translatedText || cleanText;
  } catch (error) {
    console.error("[Translation Helper] Failed to translate:", error);
    return cleanText;
  }
}

/**
 * A React component that dynamically translates its text child when the active language changes.
 */
export const TranslatedText = ({ text }) => {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (lang === "en" || !text) {
      setTranslated(text);
      return;
    }

    // Attempt local dictionary lookup first (sync, no flicker)
    const lowerText = text.trim().toLowerCase();
    if (localFallbackMap[lang] && localFallbackMap[lang][lowerText]) {
      setTranslated(localFallbackMap[lang][lowerText]);
      return;
    }

    setLoading(true);
    translateText(text, lang)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, lang]);

  return <>{translated}</>;
};
