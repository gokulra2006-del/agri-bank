// Lightweight Multilingual Translation Dictionary for AgriSahay Banking
// Covers English (en), Hindi (hi), Kannada (kn), Tamil (ta), and Telugu (te)

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' }
];

export const DICTIONARY = {
  // Navigation Items
  nav_dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ta: 'முகப்பு பலகை',
    te: 'డాష్‌బోర్డ్'
  },
  nav_impact_dashboard: {
    "en": "Impact Dashboard",
    "hi": "प्रभाव डैशबोर्ड",
    "kn": "ಪ್ರಭಾವ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "ta": "தாக்கக் கட்டுப்பாட்டு பலகை",
    "te": "ఇంపాక్ట్ డాష్‌బోర్డ్"
},
  nav_repayment_planner: {
    "en": "Harvest Repayment Planner",
    "hi": "फसल आधारित पुनर्भुगतान योजनाकार",
    "kn": "ಬೆಳೆ ಆಧಾರಿತ ಮರುಪಾವತಿ ಯೋಜನೆ",
    "ta": "அறுவடை மறுசெலுத்துகை திட்டமிடுநர்",
    "te": "పంట ఆధారిత రీపేమెంట్ ప్లానర్"
},
  nav_risk_simulator: {
    "en": "What-If Risk Simulator",
    "hi": "व्हाट-इफ जोखिम सिम्युलेटर",
    "kn": "ವಾಟ್-ಇಫ್ ಅಪಾಯ ಸಿಮ್ಯುಲೇಟರ್",
    "ta": "இடர் உருவகப்படுத்தி",
    "te": "రిస్క్ సిమ్యులేటర్"
},
  nav_village_heatmap: {
    "en": "Village Risk Heatmap",
    "hi": "ग्राम जोखिम हीटमैप",
    "kn": "ಗ್ರಾಮ ಅಪಾಯ ಹೀಟ್‌ಮ್ಯಾಪ್",
    "ta": "கிராம இடர் வெப்ப வரைபடம்",
    "te": "గ్రామ రిస్క్ హీట్‌మ్యాప్"
},
  nav_privacy_center: {
    "en": "Farmer Consent & Privacy",
    "hi": "किसान सहमति व गोपनीयता केंद्र",
    "kn": "ರೈತರ ಸಮ್ಮತಿ ಮತ್ತು ಗೌಪ್ಯತೆ",
    "ta": "விவசாயி ஒப்புதல் & தனியுரிமை",
    "te": "రైతు సమ్మతి & గోప్యత"
},
  nav_innovation_center: {
    en: 'Innovation Center',
    hi: 'इनोवेशन सेंटर',
    kn: 'ಇನ್ನೋವೇಶನ್ ಸೆಂಟರ್',
    ta: 'புதுமை மையம்',
    te: 'ఇన్నోవేషన్ సెంటర్'
  },
  nav_field_mode: {
    en: 'Field Officer Mode',
    hi: 'फील्ड अधिकारी मोड',
    kn: 'ಕ್ಷೇತ್ರ ಅಧಿಕಾರಿ ಮೋಡ್',
    ta: 'கள அதிகாரி முறை',
    te: 'ఫీల్డ్ అధికారి మోడ్'
  },
  nav_farmers: {
    en: 'Farmers Directory',
    hi: 'किसान डायरेक्टरी',
    kn: 'ರೈತರ ಡೈರೆಕ್ಟರಿ',
    ta: 'விவசாயிகள் பட்டியல்',
    te: 'రైతుల డైరెక్టరీ'
  },
  nav_loans: {
    en: 'Loan Applications',
    hi: 'ऋण आवेदन',
    kn: 'ಸಾಲ ಅರ್ಜಿಗಳು',
    ta: 'கடன் விண்ணப்பங்கள்',
    te: 'రుణ దరఖాస్తులు'
  },
  nav_eligibility: {
    en: 'Eligibility Assessment',
    hi: 'पात्रता मूल्यांकन',
    kn: 'ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ',
    ta: 'தகுதி மதிப்பீடு',
    te: 'అర్హత అంచనా'
  },
  nav_repayments: {
    en: 'Repayments Ledger',
    hi: 'पुनर्भुगतान लेजर',
    kn: 'ಮರುಪಾವತಿ ಲೆಕ್ಕ',
    ta: 'மறுசெலுத்துகை ஏடு',
    te: 'తిరిగి చెల్లింపుల లెడ్జర్'
  },
  nav_risk_monitoring: {
    en: 'Credit Risk Radar',
    hi: 'क्रेडिट जोखिम रडार',
    kn: 'ಕ್ರೆಡಿಟ್ ಅಪಾಯ ರಾಡಾರ್',
    ta: 'கடன் அபாய ரேடார்',
    te: 'క్రెడిట్ రిస్క్ రాడార్'
  },
  nav_weather_risk: {
    en: 'Weather & Crop Risk',
    hi: 'मौसम व फसल जोखिम',
    kn: 'ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆ ಅಪಾಯ',
    ta: 'வானிலை மற்றும் பயிர் ஆபத்து',
    te: 'వాతావరణం & పంట రిస్క్'
  },
  nav_crop_calendar: {
    en: 'Crop Calendar',
    hi: 'फसल कैलेंडर',
    kn: 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್',
    ta: 'பயிர் நாட்காட்டி',
    te: 'పంట క్యాలెండర్'
  },
  nav_schemes: {
    en: 'Schemes & Insurance',
    hi: 'सरकारी योजनाएं व बीमा',
    kn: 'ಯೋಜನೆಗಳು ಮತ್ತು ವಿಮೆ',
    ta: 'திட்டங்கள் மற்றும் காப்பீடு',
    te: 'పథకాలు మరియు బీమా'
  },
  nav_documents: {
    en: 'Documents Vault',
    hi: 'दस्तावेज़ वॉल्ट',
    kn: 'ದಾಖಲೆಗಳ ವಾಲ್ಟ್',
    ta: 'ஆவணங்கள் பெட்டகம்',
    te: 'డాక్యుమెంట్ల వాల్ట్'
  },
  nav_branches: {
    en: 'Branches & Staff',
    hi: 'शाखाएं एवं स्टाफ',
    kn: 'ಶಾಖೆಗಳು ಮತ್ತು ಸಿಬ್ಬಂದಿ',
    ta: 'கிளைகள் மற்றும் பணியாளர்கள்',
    te: 'శాఖలు మరియు సిబ్బంది'
  },
  nav_reports: {
    en: 'Reports & Export',
    hi: 'रिपोर्ट्स व निर्यात',
    kn: 'ವರದಿಗಳು ಮತ್ತು ರಫ್ತು',
    ta: 'அறிக்கைகள் மற்றும் ஏற்றுமதி',
    te: 'నివేదికలు మరియు ఎగుమతి'
  },
  nav_audit_log: {
    en: 'Audit Trail',
    hi: 'ऑडिट ट्रेल',
    kn: 'ಆಡಿಟ್ ಟ್ರಯಲ್',
    ta: 'தணிக்கை பதிவு',
    te: 'ఆడిట్ లాగ్'
  },
  nav_help_desk: {
    en: 'Farmer Help Desk',
    hi: 'किसान सहायता केंद्र',
    kn: 'ರೈತ ಸಹಾಯ ಕೇಂದ್ರ',
    ta: 'விவசாயி உதவி மையம்',
    te: 'రైతు సహాయ కేంద్రం'
  },
  nav_notifications: {
    en: 'Notifications',
    hi: 'अधिसूचनाएं',
    kn: 'ಅಧಿಸೂಚನೆಗಳು',
    ta: 'அறிவிப்புகள்',
    te: 'నోటిఫికేషన్లు'
  },
  nav_settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    ta: 'அமைப்புகள்',
    te: 'సెట్టింగ్‌లు'
  },

  // Common Headings & Actions
  dashboard_title: {
    en: 'Agriculture Credit Overview',
    hi: 'कृषि ऋण समग्र समीक्षा',
    kn: 'ಕೃಷಿ ಸಾಲ ಸಮಗ್ರ ಅವಲೋಕನ',
    ta: 'விவசாய கடன் கண்ணோட்டம்',
    te: 'వ్యవసాయ రుణ సమగ్ర పరిశీలన'
  },
  btn_register_farmer: {
    en: 'Register Farmer',
    hi: 'किसान पंजीकरण',
    kn: 'ರೈತರ ನೋಂದಣಿ',
    ta: 'விவசாயி பதிவு',
    te: 'రైతు నమోదు'
  },
  btn_new_loan: {
    en: 'New Loan Application',
    hi: 'नया ऋण आवेदन',
    kn: 'ಹೊಸ ಸಾಲ ಅರ್ಜಿ',
    ta: 'புதிய கடன் விண்ணப்பம்',
    te: 'కొత్త రుణ దరఖాస్తు'
  },
  btn_export_csv: {
    en: 'Export to Excel / CSV',
    hi: 'एक्सेल/सीएसवी निर्यात',
    kn: 'ಎಕ್ಸೆಲ್/ಸಿಎಸ್ವಿ ರಫ್ತು',
    ta: 'எக்செல்/சிஎஸ்வி ஏற்றுமதி',
    te: 'ఎక్సెల్/CSV ఎగుమతి'
  },
  btn_cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    kn: 'ರದ್ದುಮಾಡಿ',
    ta: 'ரத்து செய்',
    te: 'రద్దు చేయి'
  },
  btn_confirm: {
    en: 'Confirm',
    hi: 'पुष्टि करें',
    kn: 'ದೃಢೀಕರಿಸಿ',
    ta: 'உறுதி செய்',
    te: 'నిర్ధారించు'
  },

  // Status Labels
  status_draft: {
    en: 'Draft',
    hi: 'ड्राफ्ट',
    kn: 'ಕರಡು',
    ta: 'வரைவு',
    te: 'చిత్తుప్రతి'
  },
  status_submitted: {
    en: 'Submitted',
    hi: 'जमा किया गया',
    kn: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
    ta: 'சமர்ப்பிக்கப்பட்டது',
    te: 'సమర్పించబడింది'
  },
  status_under_review: {
    en: 'Under Review',
    hi: 'समीक्षाधीन',
    kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    ta: 'பரிசீலனையில் உள்ளது',
    te: 'పరిశీలనలో ఉంది'
  },
  status_approved: {
    en: 'Approved',
    hi: 'स्वीकृत',
    kn: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    ta: 'ஒப்புதல் அளிக்கப்பட்டது',
    te: 'ఆమోదించబడింది'
  },
  status_rejected: {
    en: 'Rejected',
    hi: 'अस्वीकृत',
    kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    ta: 'நிராகரிக்கப்பட்டது',
    te: 'తిరస్కరించబడింది'
  },
  status_disbursed: {
    en: 'Disbursed',
    hi: 'संवितरित',
    kn: 'ವಿತರಿಸಲಾಗಿದೆ',
    ta: 'வழங்கப்பட்டது',
    te: 'పంపిణీ చేయబడింది'
  },
  status_paid: {
    en: 'Paid',
    hi: 'भुगतान पूरा',
    kn: 'ಪಾವತಿಸಲಾಗಿದೆ',
    ta: 'செலுத்தப்பட்டது',
    te: 'చెల్లించబడింది'
  },
  status_due_soon: {
    en: 'Due Soon',
    hi: 'शीघ्र देय',
    kn: 'ಶೀಘ್ರದಲ್ಲೇ ಬಾಕಿ',
    ta: 'விரைவில் செலுத்த வேண்டும்',
    te: 'త్వరలో చెల్లించాలి'
  },
  status_overdue: {
    en: 'Overdue',
    hi: 'अतिदेय (विलंबित)',
    kn: 'ಮೀರಿದ ಬಾಕಿ',
    ta: 'காலாவதியானது',
    te: 'గడువు ముగిసింది'
  },
  status_verified: {
    en: 'Verified',
    hi: 'सत्यापित',
    kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    ta: 'சரிபார்க்கப்பட்டது',
    te: 'ధృవీకరించబడింది'
  }
};

export const t = (key, lang = 'en') => {
  if (DICTIONARY[key] && DICTIONARY[key][lang]) {
    return DICTIONARY[key][lang];
  }
  if (DICTIONARY[key] && DICTIONARY[key]['en']) {
    return DICTIONARY[key]['en'];
  }
  return key;
};
