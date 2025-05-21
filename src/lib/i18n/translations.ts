
export type Language = 'en' | 'te' | 'kn';

export const translations = {
  en: {
    // Common
    appName: "SaiBalaji Progress Tracker",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    name: "Name",
    role: "Role",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    remove: "Remove",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    welcome: "Welcome",
    logout: "Logout",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    tableView: "Table View",
    cardView: "Card View",
    
    // Roles
    admin: "Admin",
    leader: "Leader",
    checker: "Checker",
    owner: "Owner",
    
    // Navigation
    navigation: "Navigation",
    home: "Home",
    projects: "Projects",
    progress: "Progress",
    payments: "Payments",
    statistics: "Statistics",
    backup: "Backup",
    
    // Auth
    signInWith: "Sign in with",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    enterOtp: "Enter the OTP sent to your email",
    resendOtp: "Resend OTP",
    verifyOtp: "Verify OTP",
    otpSentTo: "OTP sent to",
    
    // Leader sections
    createProject: "Create Project",
    addProgress: "Add Progress",
    viewProgress: "View Progress",
    requestPayment: "Request Payment",
    viewPayment: "View Payments",
    
    // Checker sections
    reviewSubmissions: "Review Submissions",
    reviewHistory: "Review History",
    
    // Owner sections
    paymentQueue: "Payment Queue",
    
    // Admin sections
    manageCredentials: "Manage Credentials",
    manageVehicles: "Manage Vehicles",
    manageDrivers: "Manage Drivers",
    
    // Backup
    backupLinks: "Backup Links",
    availableBackupLinks: "Available Backup Links",
    noBackupLinks: "No backup links have been added yet.",
    adminAddBackupLinks: "The admin will add backup links soon.",
    
    // Messages
    allFieldsRequired: "All fields are required",
    passwordsDoNotMatch: "Passwords do not match",
    passwordMinLength: "Password must be at least 6 characters",
    signUpSuccess: "Account created successfully",
    loginSuccess: "Logged in successfully",
    logoutSuccess: "Logged out successfully",
    resetLinkSent: "Password reset link sent to your email",
    passwordResetSuccess: "Password reset successfully",
    invalidCredentials: "Invalid email or password",
    somethingWentWrong: "Something went wrong. Please try again.",
    otpSent: "OTP has been sent to your email",
    otpVerified: "OTP verified successfully",
    invalidOtp: "Invalid OTP. Please try again.",
    selectLanguage: "Select language",
  },
  te: {
    // Telugu translations
    appName: "సాయి బాలాజీ ప్రోగ్రెస్ ట్రాకర్",
    login: "లాగిన్",
    register: "నమోదు",
    email: "ఇమెయిల్",
    password: "పాస్వర్డ్",
    confirmPassword: "పాస్వర్డ్ నిర్ధారించండి",
    signIn: "సైన్ ఇన్",
    signUp: "సైన్ అప్",
    forgotPassword: "పాస్వర్డ్ మర్చిపోయారా",
    resetPassword: "పాస్వర్డ్ రీసెట్",
    name: "పేరు",
    role: "పాత్ర",
    submit: "సమర్పించండి",
    cancel: "రద్దు",
    save: "సేవ్",
    delete: "తొలగించు",
    edit: "సవరించు",
    view: "వీక్షించండి",
    add: "జోడించు",
    remove: "తొలగించు",
    search: "శోధన",
    filter: "ఫిల్టర్",
    sort: "క్రమీకరించు",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    welcome: "స్వాగతం",
    logout: "లాగ్అవుట్",
    dashboard: "డాష్బోర్డ్",
    profile: "ప్రొఫైల్",
    settings: "సెట్టింగ్స్",
    tableView: "పట్టిక వీక్షణ",
    cardView: "కార్డ్ వీక్షణ",
    
    // Roles
    admin: "నిర్వాహకుడు",
    leader: "నాయకుడు",
    checker: "తనిఖీదారు",
    owner: "యజమాని",
    
    // Navigation
    navigation: "నావిగేషన్",
    home: "హోమ్",
    projects: "ప్రాజెక్ట్లు",
    progress: "పురోగతి",
    payments: "చెల్లింపులు",
    statistics: "గణాంకాలు",
    backup: "బ్యాకప్",
    
    // Auth
    signInWith: "దీనితో సైన్ ఇన్ చేయండి",
    createAccount: "ఖాతా సృష్టించండి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    dontHaveAccount: "ఖాతా లేదా?",
    enterOtp: "మీ ఇమెయిల్కి పంపిన OTP ని నమోదు చేయండి",
    resendOtp: "OTP మళ్ళీ పంపించు",
    verifyOtp: "OTP ని ధృవీకరించండి",
    otpSentTo: "OTP పంపబడింది",
    
    // Leader sections
    createProject: "ప్రాజెక్ట్ సృష్టించండి",
    addProgress: "పురోగతి జోడించండి",
    viewProgress: "పురోగతి వీక్షించండి",
    requestPayment: "చెల్లింపు అభ్యర్థించండి",
    viewPayment: "చెల్లింపులను వీక్షించండి",
    
    // Checker sections
    reviewSubmissions: "సమర్పణలను సమీక్షించండి",
    reviewHistory: "సమీక్ష చరిత్ర",
    
    // Owner sections
    paymentQueue: "చెల్లింపు క్యూ",
    
    // Admin sections
    manageCredentials: "ఆధారాలను నిర్వహించండి",
    manageVehicles: "వాహనాలను నిర్వహించండి",
    manageDrivers: "డ్రైవర్లను నిర్వహించండి",
    
    // Backup
    backupLinks: "బ్యాకప్ లింక్స్",
    availableBackupLinks: "అందుబాటులో ఉన్న బ్యాకప్ లింక్స్",
    noBackupLinks: "బ్యాకప్ లింక్లు ఇంకా జోడించబడలేదు.",
    adminAddBackupLinks: "అడ్మిన్ త్వరలో బ్యాకప్ లింక్లను జోడిస్తారు.",
    
    // Messages
    allFieldsRequired: "అన్ని ఫీల్డ్‌లు అవసరం",
    passwordsDoNotMatch: "పాస్‌వర్డ్‌లు సరిపోలలేదు",
    passwordMinLength: "పాస్వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి",
    signUpSuccess: "ఖాతా విజయవంతంగా సృష్టించబడింది",
    loginSuccess: "విజయవంతంగా లాగిన్ అయ్యారు",
    logoutSuccess: "విజయవంతంగా లాగ్అవుట్ అయ్యారు",
    resetLinkSent: "మీ ఇమెయిల్‌కి పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది",
    passwordResetSuccess: "పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది",
    invalidCredentials: "చెల్లని ఇమెయిల్ లేదా పాస్‌వర్డ్",
    somethingWentWrong: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    otpSent: "OTP మీ ఇమెయిల్‌కి పంపబడింది",
    otpVerified: "OTP విజయవంతంగా ధృవీకరించబడింది",
    invalidOtp: "చెల్లని OTP. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    selectLanguage: "భాష ఎంచుకోండి",
  },
  kn: {
    // Kannada translations
    appName: "ಸಾಯಿ ಬಾಲಾಜಿ ಪ್ರಗತಿ ಟ್ರ್ಯಾಕರ್",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    signIn: "ಸೈನ್ ಇನ್",
    signUp: "ಸೈನ್ ಅಪ್",
    forgotPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ",
    resetPassword: "ಪಾಸ್‌ವರ್ಡ್ ರೀಸೆಟ್",
    name: "ಹೆಸರು",
    role: "ಪಾತ್ರ",
    submit: "ಸಲ್ಲಿಸು",
    cancel: "ರದ್ದುಮಾಡು",
    save: "ಉಳಿಸು",
    delete: "ಅಳಿಸು",
    edit: "ಸಂಪಾದಿಸು",
    view: "ವೀಕ್ಷಿಸಿ",
    add: "ಸೇರಿಸು",
    remove: "ತೆಗೆದುಹಾಕು",
    search: "ಹುಡುಕು",
    filter: "ಫಿಲ್ಟರ್",
    sort: "ವಿಂಗಡಿಸು",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ದೋಷ",
    success: "ಯಶಸ್ಸು",
    welcome: "ಸ್ವಾಗತ",
    logout: "ಲಾಗ್ಔಟ್",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    profile: "ಪ್ರೊಫೈಲ್",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    tableView: "ಟೇಬಲ್ ವೀಕ್ಷಣೆ",
    cardView: "ಕಾರ್ಡ್ ವೀಕ್ಷಣೆ",
    
    // Roles
    admin: "ನಿರ್ವಾಹಕ",
    leader: "ನಾಯಕ",
    checker: "ಪರಿಶೀಲಕ",
    owner: "ಮಾಲೀಕ",
    
    // Navigation
    navigation: "ನ್ಯಾವಿಗೇಷನ್",
    home: "ಹೋಮ್",
    projects: "ಯೋಜನೆಗಳು",
    progress: "ಪ್ರಗತಿ",
    payments: "ಪಾವತಿಗಳು",
    statistics: "ಅಂಕಿಅಂಶಗಳು",
    backup: "ಬ್ಯಾಕಪ್",
    
    // Auth
    signInWith: "ಇದರೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    dontHaveAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
    enterOtp: "ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಿದ OTP ಅನ್ನು ನಮೂದಿಸಿ",
    resendOtp: "OTP ಮರುಕಳುಹಿಸಿ",
    verifyOtp: "OTP ಪರಿಶೀಲಿಸಿ",
    otpSentTo: "OTP ಕಳುಹಿಸಲಾಗಿದೆ",
    
    // Leader sections
    createProject: "ಯೋಜನೆ ರಚಿಸಿ",
    addProgress: "ಪ್ರಗತಿ ಸೇರಿಸಿ",
    viewProgress: "ಪ್ರಗತಿ ವೀಕ್ಷಿಸಿ",
    requestPayment: "ಪಾವತಿ ವಿನಂತಿಸಿ",
    viewPayment: "ಪಾವತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    
    // Checker sections
    reviewSubmissions: "ಸಲ್ಲಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    reviewHistory: "ಪರಿಶೀಲನಾ ಇತಿಹಾಸ",
    
    // Owner sections
    paymentQueue: "ಪಾವತಿ ಕ್ಯೂ",
    
    // Admin sections
    manageCredentials: "ರುಜುವಾತುಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    manageVehicles: "ವಾಹನಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    manageDrivers: "ಚಾಲಕರನ್ನು ನಿರ್ವಹಿಸಿ",
    
    // Backup
    backupLinks: "ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳು",
    availableBackupLinks: "ಲಭ್ಯವಿರುವ ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳು",
    noBackupLinks: "ಇನ್ನೂ ಯಾವುದೇ ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.",
    adminAddBackupLinks: "ನಿರ್ವಾಹಕರು ಶೀಘ್ರದಲ್ಲೇ ಬ್ಯಾಕಪ್ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸುತ್ತಾರೆ.",
    
    // Messages
    allFieldsRequired: "ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳು ಅಗತ್ಯವಿದೆ",
    passwordsDoNotMatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    passwordMinLength: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು",
    signUpSuccess: "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ",
    loginSuccess: "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ",
    logoutSuccess: "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ಔಟ್ ಆಗಿದೆ",
    resetLinkSent: "ಪಾಸ್‌ವರ್ಡ್ ರೀಸೆಟ್ ಲಿಂಕ್ ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    passwordResetSuccess: "ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ರೀಸೆಟ್ ಮಾಡಲಾಗಿದೆ",
    invalidCredentials: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್",
    somethingWentWrong: "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    otpSent: "OTP ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    otpVerified: "OTP ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    invalidOtp: "ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  }
};

// Default language
export const defaultLanguage: Language = 'en';

// Get translation for a key
export const getTranslation = (key: string, language: Language): string => {
  const languageDict = translations[language];
  return languageDict[key as keyof typeof languageDict] || translations[defaultLanguage][key as keyof typeof translations['en']] || key;
};
