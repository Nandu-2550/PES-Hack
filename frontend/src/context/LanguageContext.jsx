import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    home: 'Home', diagnose: 'Diagnose', jobs: 'Jobs',
    machinery: 'Machinery', weather: 'Weather',
    market: 'Market', schemes: 'Schemes', loans: 'Loans',
    // Auth
    login: 'Login', register: 'Register', logout: 'Logout',
    name: 'Name', email: 'Email (optional)', phone: 'Phone',
    password: 'Password', state: 'State', district: 'District',
    // Dashboard
    welcome: 'Welcome', good_morning: 'Good Morning',
    quick_actions: 'Quick Actions', scan_crop: 'Scan Crop',
    find_jobs: 'Find Jobs', rent_machinery: 'Rent Machinery',
    sell_crops: 'Sell Crops', view_schemes: 'View Schemes',
    find_loans: 'Find Loans',
    // Market
    crop_market: 'Crop Market', sell_your_crop: 'Sell Your Crop',
    crop_name: 'Crop Name', quantity: 'Quantity (kg)',
    price_per_kg: 'Price per kg (₹)', location: 'Location',
    description: 'Description', contact: 'Contact',
    available: 'Available', sold_out: 'Mark as Sold Out',
    delete_listing: 'Delete', post_crop: 'Post Crop',
    seller_info: 'Seller Info', call_seller: 'Call Seller',
    // Schemes
    govt_schemes: 'Government Schemes', apply_now: 'Apply Now',
    scheme_summary: 'Summary',
    // Loans
    agri_loans: 'Agricultural Loans', interest_rate: 'Interest Rate',
    know_more: 'Know More',
    // Voice Bot
    voice_bot: 'Voice Assistant', listening: 'Listening...',
    tap_to_speak: 'Tap to Speak',
    // General
    loading: 'Loading...', error: 'Something went wrong',
    save: 'Save', cancel: 'Cancel', submit: 'Submit',
    online: 'Online', offline: 'Offline',
    you_are_offline: 'You are offline. Showing cached data.',
    synced: 'Synced', last_updated: 'Last updated',
    unavailable: 'Unavailable',
    call_owner: 'Call Owner',
    mark_available: 'Mark Available',
    mark_unavailable: 'Mark Unavailable',
    brand: 'Brand',
    owner: 'Owner',
  },
  kn: {
    home: 'ಮುಖಪುಟ', diagnose: 'ರೋಗ ಪತ್ತೆ', jobs: 'ಕೆಲಸಗಳು',
    machinery: 'ಯಂತ್ರೋಪಕರಣ', weather: 'ಹವಾಮಾನ',
    market: 'ಮಾರುಕಟ್ಟೆ', schemes: 'ಯೋಜನೆಗಳು', loans: 'ಸಾಲಗಳು',
    login: 'ಲಾಗಿನ್', register: 'ನೋಂದಣಿ', logout: 'ಲಾಗ್ ಔಟ್',
    name: 'ಹೆಸರು', email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)', phone: 'ಫೋನ್',
    password: 'ಪಾಸ್ವರ್ಡ್', state: 'ರಾಜ್ಯ', district: 'ಜಿಲ್ಲೆ',
    welcome: 'ಸ್ವಾಗತ', good_morning: 'ಶುಭೋದಯ',
    quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', scan_crop: 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್',
    find_jobs: 'ಕೆಲಸ ಹುಡುಕಿ', rent_machinery: 'ಯಂತ್ರ ಬಾಡಿಗೆ',
    sell_crops: 'ಬೆಳೆ ಮಾರಿ', view_schemes: 'ಯೋಜನೆ ನೋಡಿ',
    find_loans: 'ಸಾಲ ಹುಡುಕಿ',
    crop_market: 'ಬೆಳೆ ಮಾರುಕಟ್ಟೆ', sell_your_crop: 'ನಿಮ್ಮ ಬೆಳೆ ಮಾರಿ',
    crop_name: 'ಬೆಳೆ ಹೆಸರು', quantity: 'ಪ್ರಮಾಣ (ಕೆಜಿ)',
    price_per_kg: 'ಕೆಜಿಗೆ ಬೆಲೆ (₹)', location: 'ಸ್ಥಳ',
    description: 'ವಿವರಣೆ', contact: 'ಸಂಪರ್ಕ',
    available: 'ಲಭ್ಯ', sold_out: 'ಮಾರಾಟ ಮಾಡಲಾಗಿದೆ',
    delete_listing: 'ಅಳಿಸಿ', post_crop: 'ಬೆಳೆ ಪೋಸ್ಟ್ ಮಾಡಿ',
    seller_info: 'ಮಾರಾಟಗಾರ ಮಾಹಿತಿ', call_seller: 'ಮಾರಾಟಗಾರರನ್ನು ಕರೆ ಮಾಡಿ',
    govt_schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', apply_now: 'ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    scheme_summary: 'ಸಾರಾಂಶ',
    agri_loans: 'ಕೃಷಿ ಸಾಲಗಳು', interest_rate: 'ಬಡ್ಡಿ ದರ',
    know_more: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    voice_bot: 'ಧ್ವನಿ ಸಹಾಯಕ', listening: 'ಆಲಿಸುತ್ತಿದ್ದೇನೆ...',
    tap_to_speak: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', error: 'ಏನೋ ತಪ್ಪಾಗಿದೆ',
    save: 'ಉಳಿಸಿ', cancel: 'ರದ್ದು', submit: 'ಸಲ್ಲಿಸಿ',
    online: 'ಆನ್ಲೈನ್', offline: 'ಆಫ್ಲೈನ್',
    you_are_offline: 'ನೀವು ಆಫ್ಲೈನ್ ಆಗಿದ್ದೀರಿ. ಸಂಗ್ರಹಿಸಿದ ಡೇಟಾ ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    synced: 'ಸಿಂಕ್ ಆಗಿದೆ', last_updated: 'ಕೊನೆಯ ಅಪ್ಡೇಟ್',
    unavailable: 'ಲಭ್ಯವಿಲ್ಲ',
    call_owner: 'ಮಾಲೀಕರಿಗೆ ಕರೆ ಮಾಡಿ',
    mark_available: 'ಲಭ್ಯವೆಂದು ಗುರುತಿಸಿ',
    mark_unavailable: 'ಲಭ್ಯವಿಲ್ಲವೆಂದು ಗುರುತಿಸಿ',
    brand: 'ಬ್ರಾಂಡ್',
    owner: 'ಮಾಲೀಕರು',
  },
  hi: {
    home: 'होम', diagnose: 'जाँच करें', jobs: 'काम',
    machinery: 'मशीनरी', weather: 'मौसम',
    market: 'बाज़ार', schemes: 'योजनाएं', loans: 'ऋण',
    login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉग आउट',
    name: 'नाम', email: 'ईमेल (वैकल्पिक)', phone: 'फ़ोन',
    password: 'पासवर्ड', state: 'राज्य', district: 'जिला',
    welcome: 'स्वागत', good_morning: 'सुप्रभात',
    quick_actions: 'त्वरित कार्य', scan_crop: 'फसल स्कैन',
    find_jobs: 'काम खोजें', rent_machinery: 'मशीन किराया',
    sell_crops: 'फसल बेचें', view_schemes: 'योजना देखें',
    find_loans: 'ऋण खोजें',
    crop_market: 'फसल बाज़ार', sell_your_crop: 'अपनी फसल बेचें',
    crop_name: 'फसल का नाम', quantity: 'मात्रा (किग्रा)',
    price_per_kg: 'प्रति किग्रा मूल्य (₹)', location: 'स्थान',
    description: 'विवरण', contact: 'संपर्क',
    available: 'उपलब्ध', sold_out: 'बिक गया',
    delete_listing: 'हटाएं', post_crop: 'फसल पोस्ट करें',
    seller_info: 'विक्रेता जानकारी', call_seller: 'विक्रेता को कॉल करें',
    govt_schemes: 'सरकारी योजनाएं', apply_now: 'अभी आवेदन करें',
    scheme_summary: 'सारांश',
    agri_loans: 'कृषि ऋण', interest_rate: 'ब्याज दर',
    know_more: 'और जानें',
    voice_bot: 'आवाज़ सहायक', listening: 'सुन रहा हूं...',
    tap_to_speak: 'बोलने के लिए दबाएं',
    loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ',
    save: 'सहेजें', cancel: 'रद्द करें', submit: 'जमा करें',
    online: 'ऑनलाइन', offline: 'ऑफलाइन',
    you_are_offline: 'आप ऑफलाइन हैं। कैश किया गया डेटा दिखाया जा रहा है।',
    synced: 'सिंक हो गया', last_updated: 'अंतिम अपडेट',
    unavailable: 'अनुपलब्ध',
    call_owner: 'मालिक को कॉल करें',
    mark_available: 'उपलब्ध चिह्नित करें',
    mark_unavailable: 'अनुपलब्ध चिह्नित करें',
    brand: 'ब्रांड',
    owner: 'मालिक',
  },
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('agrishield_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('agrishield_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
