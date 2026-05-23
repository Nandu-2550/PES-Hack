import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    home: 'Home', diagnose: 'Diagnose', nav_jobs: 'Jobs',
    nav_machinery: 'Machinery', weather: 'Weather',
    market: 'Market', nav_schemes: 'Schemes', nav_loans: 'Loans',
    // Auth
    login: 'Login', register: 'Register', logout: 'Logout',
    name: 'Name', email: 'Email (optional)', phone: 'Phone',
    password: 'Password', state: 'State', district: 'District',
    // Diagnosis Results
    symptoms_observed: 'Symptoms Observed',
    immediate_action: 'Do This TODAY',
    chemical_treatment: 'Chemical Treatment',
    organic_alternative: 'Organic Alternative',
    prevention: 'Prevention',
    buy_products: 'Buy Treatment Products',
    verified_sellers: 'Verified agricultural suppliers in India:',
    scan_another: 'Scan Another Crop',
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
    // Structured dashboard mappings
    jobs: {
      title: "Agricultural Jobs",
      workersNeeded: "Workers Needed",
      duration: "Duration",
      salary: "Salary",
      perDay: "per day",
      stay: "Accommodation",
      postedBy: "Posted by",
      callToApply: "Call to Apply",
      harvesting: "Harvesting",
      planting: "Planting",
      irrigation: "Irrigation",
      days: "days",
      noJobs: "No jobs available"
    },
    machinery: {
      title: "Agricultural Machinery",
      rentPerDay: "Rent per day",
      available: "Available",
      unavailable: "Unavailable",
      bookNow: "Book Now",
      owner: "Owner",
      location: "Location",
      tractor: "Tractor",
      harvester: "Harvester",
      sprayer: "Sprayer"
    },
    loans: {
      title: "Agricultural Loans",
      maxLimit: "Maximum Limit",
      interestRate: "Interest Rate",
      eligibility: "Eligibility",
      applyNow: "Apply Now",
      learnMore: "Learn More",
      perAnnum: "per annum"
    },
    schemes: {
      title: "Government Schemes",
      applyNow: "Apply Now",
      deadline: "Deadline",
      benefit: "Benefit",
      eligibility: "Eligibility"
    }
  },
  kn: {
    home: 'ಮುಖಪುಟ', diagnose: 'ರೋಗ ಪತ್ತೆ', nav_jobs: 'ಕೆಲಸಗಳು',
    nav_machinery: 'ಯಂತ್ರೋಪಕರಣ', weather: 'ಹವಾಮಾನ',
    market: 'ಮಾರುಕಟ್ಟೆ', nav_schemes: 'ಯೋಜನೆಗಳು', nav_loans: 'ಸಾಲಗಳು',
    login: 'ಲಾಗಿನ್', register: 'ನೋಂದಣಿ', logout: 'ಲಾಗ್ ಔಟ್',
    name: 'ಹೆಸರು', email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)', phone: 'ಫೋನ್',
    password: 'ಪಾಸ್ವರ್ಡ್', state: 'ರಾಜ್ಯ', district: 'ಜಿಲ್ಲೆ',
    // Diagnosis Results
    symptoms_observed: 'ಕಂಡುಬರುವ ರೋಗಲಕ್ಷಣಗಳು',
    immediate_action: 'ಇಂದೇ ಇದನ್ನು ಮಾಡಿ',
    chemical_treatment: 'ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ',
    organic_alternative: 'ಸಾವಯವ ಪರ್ಯಾಯ',
    prevention: 'ತಡೆಗಟ್ಟುವಿಕೆ',
    buy_products: 'ಚಿಕಿತ್ಸಾ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ',
    verified_sellers: 'ಭಾರತದಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಪೂರೈಕೆದಾರರು:',
    scan_another: 'ಮತ್ತೊಂದು ಬೆಳೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
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
    // Structured dashboard mappings in Kannada
    jobs: {
      title: "ಕೃಷಿ ಉದ್ಯೋಗಗಳು",
      workersNeeded: "ಅಗತ್ಯ ಕಾರ್ಮಿಕರು",
      duration: "ಅವಧಿ",
      salary: "ವೇತನ",
      perDay: "ಪ್ರತಿ ದಿನ",
      stay: "ವಸತಿ",
      postedBy: "ಪೋಸ್ಟ್ ಮಾಡಿದ್ದಾರೆ",
      callToApply: "ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕರೆ ಮಾಡಿ",
      harvesting: "ಕೊಯ್ಲು",
      planting: "ನಾಟಿ",
      irrigation: "ಸೀರಾವರಿ",
      days: "ದಿನಗಳು",
      noJobs: "ಯಾವುದೇ ಉದ್ಯೋಗಗಳಿಲ್ಲ"
    },
    machinery: {
      title: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ",
      rentPerDay: "ಪ್ರತಿ ದಿನ ಬಾಡಿಗೆ",
      available: "ಲಭ್ಯವಿದೆ",
      unavailable: "ಲಭ್ಯವಿಲ್ಲ",
      bookNow: "ಈಗ ಬುಕ್ ಮಾಡಿ",
      owner: "ಮಾಲೀಕ",
      location: "ಸ್ಥಳ",
      tractor: "ಟ್ರಾಕ್ಟರ್",
      harvester: "ಕೊಯ್ಲು ಯಂತ್ರ",
      sprayer: "ಸಿಂಪಡಿಸುವ ಯಂತ್ರ"
    },
    loans: {
      title: "ಕೃಷಿ ಸಾಲಗಳು",
      maxLimit: "ಗರಿಷ್ಠ ಮಿತಿ",
      interestRate: "ಬಡ್ಡಿ ದರ",
      eligibility: "ಅರ್ಹತೆ",
      applyNow: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
      perAnnum: "ಪ್ರತಿ ವರ್ಷ"
    },
    schemes: {
      title: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      applyNow: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      deadline: "ಕೊನೆಯ ದಿನಾಂಕ",
      benefit: "ಪ್ರಯೋಜನ",
      eligibility: "ಅರ್ಹತೆ"
    }
  },
  hi: {
    home: 'होम', diagnose: 'जाँच करें', nav_jobs: 'काम',
    nav_machinery: 'मशीनरी', weather: 'मौसम',
    market: 'बाज़ार', nav_schemes: 'योजनाएं', nav_loans: 'ऋण',
    login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉग आउट',
    name: 'नाम', email: 'ईमेल (वैकल्पिक)', phone: 'फ़ोन',
    password: 'पासवर्ड', state: 'राज्य', district: 'जिला',
    // Diagnosis Results
    symptoms_observed: 'देखे गए लक्षण',
    immediate_action: 'आज ही यह करें',
    chemical_treatment: 'रासायनिक उपचार',
    organic_alternative: 'जैविक विकल्प',
    prevention: 'रोकथाम',
    buy_products: 'उपचार उत्पाद खरीदें',
    verified_sellers: 'भारत में सत्यापित कृषि आपूर्तिकर्ता:',
    scan_another: 'दूसरी फसल स्कैन करें',
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
    you_are_offline: 'आप offline हैं। कैश किया गया डेटा दिखाया जा रहा है।',
    synced: 'सिंक हो गया', last_updated: 'अंतिम अपडेट',
    unavailable: 'अनुपलब्ध',
    call_owner: 'मालिक को कॉल करें',
    mark_available: 'उपलब्ध चिह्नित करें',
    mark_unavailable: 'अनुपलब्ध चिह्नित करें',
    brand: 'ब्रांड',
    owner: 'मालिक',
    // Structured dashboard mappings in Hindi
    jobs: {
      title: "कृषि नौकरियां",
      workersNeeded: "आवश्यक मजदूर",
      duration: "अवधि",
      salary: "वेतन",
      perDay: "प्रति दिन",
      stay: "आवास",
      postedBy: "पोस्ट किया",
      callToApply: "आवेदन के लिए कॉल करें",
      harvesting: "कटाई",
      planting: "रोपाई",
      irrigation: "सिंचाई",
      days: "दिन",
      noJobs: "कोई नौकरी उपलब्ध नहीं"
    },
    machinery: {
      title: "कृषि मशीनरी",
      rentPerDay: "प्रति दिन किराया",
      available: "उपलब्ध",
      unavailable: "अनुपलब्ध",
      bookNow: "अभी बुक करें",
      owner: "मालिक",
      location: "स्थान",
      tractor: "ट्रैक्टर",
      harvester: "हार्वेस्टर",
      sprayer: "स्प्रेयर"
    },
    loans: {
      title: "कृषि ऋण",
      maxLimit: "अधिकतम सीमा",
      interestRate: "ब्याज दर",
      eligibility: "पात्रता",
      applyNow: "अभी आवेदन करें",
      learnMore: "और जानें",
      perAnnum: "प्रति वर्ष"
    },
    schemes: {
      title: "सरकारी योजनाएं",
      applyNow: "अभी आवेदन करें",
      deadline: "अंतिम तिथि",
      benefit: "लाभ",
      eligibility: "पात्रता"
    }
  },
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('agrishield_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('agrishield_lang', lang);
  }, [lang]);

  const t = (key) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      return translations[lang]?.[parts[0]]?.[parts[1]] ?? translations['en']?.[parts[0]]?.[parts[1]] ?? key;
    }
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
