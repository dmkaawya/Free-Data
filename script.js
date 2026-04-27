// ========== STATE ==========
var currentLang = 'mix';
var currentFilter = 'all';
var checkedItems = new Set();
var quizAnswers = {};

// ========== LANGUAGE ==========
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-' + lang + ']').forEach(function(el) {
        el.textContent = el.getAttribute('data-' + lang);
    });
    document.querySelectorAll('.lang-btn').forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtn = document.getElementById('btn-' + lang);
    if (activeBtn) activeBtn.classList.add('active');
    renderScams();
    renderRedFlags();
    renderCompare();
    renderChecklist();
    renderQuiz();
}

// ========== THEME ==========
function toggleTheme() {
    var body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
    } else {
        body.setAttribute('data-theme', 'dark');
    }
}

// ========== NAVIGATION ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(function(p) {
        p.classList.remove('active');
    });
    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navTarget = document.getElementById('nav-' + pageId);
    if (navTarget) navTarget.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== SCAMS DATA (50+) ==========
var scamsData = [
    {cat:"phone",title:{si:"Free Data Offers",en:"Free Data Offers",mix:"Free Data Offers"},desc:{si:'"50GB Free" - Dialog, Mobitel වැනි company මෙවැනි offers දෙන්නේ නැත!',en:'"50GB Free" - Telecom companies never give such offers!',mix:'"50GB Free" - Dialog, Mobitel වැනි company මෙවැනි offers දෙන්නේ නැත!'},example:"Vesak Special 50GB Free - Click Now!"},
    {cat:"money",title:{si:"Fake Bank Messages",en:"Fake Bank Messages",mix:"Fake Bank Messages"},desc:{si:'"Account blocked" - බැංකු WhatsApp හරහා OTP ඉල්ලන්නේ නැත!',en:'"Account blocked" - Banks never ask for OTP via WhatsApp!',mix:'"Account blocked" - බැංකු WhatsApp හරහා OTP ඉල්ලන්නේ නැත!'},example:"Your BOC account will be blocked in 24 hours!"},
    {cat:"online",title:{si:"Parcel Delivery Scams",en:"Parcel Delivery Scams",mix:"Parcel Delivery Scams"},desc:{si:'"Parcel stuck at customs" - ඇණවුමක් නොදන්නා නම් scam!',en:'"Parcel stuck at customs" - If you did not order, it is a scam!',mix:'"Parcel stuck at customs" - ඇණවුමක් නොදන්නා නම් scam!'},example:"DHL: Your package arrived. Pay Rs.1500 duty fee."},
    {cat:"money",title:{si:"Lottery / Prize Scams",en:"Lottery / Prize Scams",mix:"Lottery / Prize Scams"},desc:{si:'"You won iPhone!" - තරඟයකට සහභාගී නොවී දිනීම කළ නොහැක!',en:'"You won iPhone!" - Cannot win without participating!',mix:'"You won iPhone!" - තරඟයකට සහභාගී නොවී දිනීම කළ නොහැක!'},example:"Congrats! You won Rs.500,000 from Dubai Lottery!"},
    {cat:"money",title:{si:"Job Scams",en:"Job Scams",mix:"Job Scams"},desc:{si:'"Work from home Rs.100,000" - මුලින් මුදල් ගෙවන්න කියන්නේ නම් scam!',en:'"Work from home" - If job asks for upfront payment, it is a scam!',mix:'"Work from home" - මුලින් මුදල් ගෙවන්න කියන්නේ නම් scam!'},example:"Pay Rs.5000 for training materials to start earning!"},
    {cat:"social",title:{si:"Love / Romance Scams",en:"Love / Romance Scams",mix:"Love / Romance Scams"},desc:{si:'Social media "ආදරවන්තයින්" - මුදල් ඉල්ලන අයෙක් ගැන සැක සහිතව!',en:'Social media "lovers" - Be suspicious of anyone asking for money!',mix:'Social media "ආදරවන්තයින්" - මුදල් ඉල්ලන අයෙක් ගැන සැක සහිතව!'},example:"Baby I need money for flight ticket to see you..."},
    {cat:"gov",title:{si:"Electricity Bill Scams",en:"Utility Bill Scams",mix:"Utility Bill Scams"},desc:{si:'"Electricity disconnected" - CEB WhatsApp හරහා ගෙවීම් ඉල්ලන්නේ නැත!',en:'"Electricity disconnected" - CEB never asks payments via WhatsApp!',mix:'"Electricity disconnected" - CEB WhatsApp හරහා ගෙවීම් ඉල්ලන්නේ නැත!'},example:"CEB: Your electricity will be cut in 2 hours. Pay Rs.8500 now."},
    {cat:"money",title:{si:"Investment Scams",en:"Investment Scams",mix:"Investment Scams"},desc:{si:'"Double your money in 7 days" - quick returns කියන investment scam!',en:'"Double your money" - Any investment promising quick returns is a scam!',mix:'"Double your money" - quick returns කියන investment scam!'},example:"Invest Rs.10,000 today, get Rs.50,000 in 30 days!"},
    {cat:"online",title:{si:"QR Code Scams",en:"QR Code Scams",mix:"QR Code Scams"},desc:{si:'Unknown QR scan කිරීමෙන් money deduct විය හැක!',en:'Scanning unknown QR codes can deduct money!',mix:'Unknown QR scan කිරීමෙන් money deduct විය හැක!'},example:"Scan this QR code to claim your Rs.5000 cashback!"},
    {cat:"gov",title:{si:"Government Impersonation",en:"Government Impersonation",mix:"Government Impersonation"},desc:{si:'"Police case against you" - officials phone හරහා මුදල් ඉල්ලන්නේ නැත!',en:'"Police case" - Government officials never ask money via phone!',mix:'"Police case" - Government officials phone හරහා මුදල් ඉල්ලන්නේ නැත!'},example:"This is CID. Pay Rs.100,000 fine or we will arrest you."},
    {cat:"online",title:{si:"Fake Website Scams",en:"Fake Website Scams",mix:"Fake Website Scams"},desc:{si:'Real websites වගේ fake sites - URL හරියට බලන්න!',en:'Fake sites that look real - Always check the URL!',mix:'Real websites වගේ fake sites - URL හරියට බලන්න!'},example:"www.faceb00k-login.com/security/update"},
    {cat:"social",title:{si:"Facebook Profile Cloning",en:"Facebook Profile Cloning",mix:"Facebook Profile Cloning"},desc:{si:'ඔබේ profile copy කර fake account හදනවා',en:'Your profile is copied and a fake account is created',mix:'ඔබේ profile copy කර fake account හදනවා'},example:"Your friend's duplicate account sends you a friend request"},
    {cat:"online",title:{si:"Email Phishing",en:"Email Phishing",mix:"Email Phishing"},desc:{si:'Bank, PayPal වගේ ආයතනවලින් ආ වගේ fake emails',en:'Fake emails pretending to be from Bank, PayPal etc.',mix:'Bank, PayPal වගේ ආයතනවලින් ආ වගේ fake emails'},example:"Your PayPal account has been limited. Click to verify."},
    {cat:"phone",title:{si:"Vishing (Voice Phishing)",en:"Vishing (Voice Phishing)",mix:"Vishing (Voice Phishing)"},desc:{si:'"Bank එකෙන් call කළා" කියලා බොරු කියනවා',en:'"Calling from bank" they lie to get your details',mix:'"Bank එකෙන් call කළා" කියලා බොරු කියනවා'},example:"Hello, this is HNB fraud department. Verify your PIN."},
    {cat:"phone",title:{si:"Smishing (SMS Phishing)",en:"Smishing (SMS Phishing)",mix:"Smishing (SMS Phishing)"},desc:{si:'Fake SMS messages - links click කරන්න කියනවා',en:'Fake SMS messages asking you to click links',mix:'Fake SMS messages - links click කරන්න කියනවා'},example:"SampathBank: Account compromised. Verify at bit.ly/2xK9"},
    {cat:"social",title:{si:"Tech Support Scams",en:"Tech Support Scams",mix:"Tech Support Scams"},desc:{si:'"Microsoft එකෙන්" fake calls - PC remote access ගන්නවා',en:'"From Microsoft" fake calls - they take PC remote access',mix:'"Microsoft එකෙන්" fake calls - PC remote access ගන්නවා'},example:"Your computer has a virus. Fix it remotely for Rs.5000."},
    {cat:"money",title:{si:"Credit Card Skimming",en:"Credit Card Skimming",mix:"Credit Card Skimming"},desc:{si:'ATM/POS machines වල hidden devices මගින් card data steal කරනවා',en:'Hidden devices on ATM/POS machines steal card data',mix:'ATM/POS machines වල hidden devices මගින් card data steal කරනවා'},example:"ATM card slot looks unusual or has extra attachment"},
    {cat:"online",title:{si:"Crypto Scams",en:"Crypto Scams",mix:"Crypto Scams"},desc:{si:'Fake crypto exchanges, Ponzi schemes - "Guaranteed returns"',en:'Fake crypto exchanges, Ponzi schemes',mix:'Fake crypto exchanges, Ponzi schemes - "Guaranteed returns"'},example:"Join our Bitcoin group! 300% guaranteed returns!"},
    {cat:"social",title:{si:"Charity Scams",en:"Charity Scams",mix:"Charity Scams"},desc:{si:'"Help flood victims" කියලා මුදල් එකතු කරනවා',en:'Fake donations - collecting money "for victims"',mix:'"Help flood victims" කියලා මුදල් එකතු කරනවා'},example:"Donate Rs.1000 for Vesak dan sal victims. Share this link!"},
    {cat:"money",title:{si:"Forex Trading Scams",en:"Forex Trading Scams",mix:"Forex Trading Scams"},desc:{si:'"Professional traders" invest කරන්න කියනවා, පස්සේ නැති වෙනවා',en:'"Professional traders" ask you to invest, then disappear',mix:'"Professional traders" invest කරන්න කියනවා, පස්සේ නැති වෙනවා'},example:"I made Rs.2M from forex. Join my signal group for free!"},
    {cat:"online",title:{si:"Fake App Scams",en:"Fake App Scams",mix:"Fake App Scams"},desc:{si:'Play Store එකේ fake banking apps - official store එකෙන් බාගන්න',en:'Fake banking apps on Play Store - use official sources',mix:'Play Store එකේ fake banking apps - official store එකෙන් බාගන්න'},example:"Download BOC Mobile Plus (unofficial copycat app)"},
    {cat:"social",title:{si:"Influencer Scams",en:"Influencer Scams",mix:"Influencer Scams"},desc:{si:'"Promote your business" - මුදල් ගෙවීමෙන් පසු post කරන්නේ නැත',en:'"Promote your business" - After payment, they do not post',mix:'"Promote your business" - මුදල් ගෙවීමෙන් පසු post කරන්නේ නැත'},example:"Pay Rs.15,000 for a shoutout to 500K followers!"},
    {cat:"money",title:{si:"MLM / Pyramid Scams",en:"MLM / Pyramid Scams",mix:"MLM / Pyramid Scams"},desc:{si:'"Recruit 5 people" - Pyramid scheme වල මුදල් නැති වෙනවා',en:'"Recruit 5 people" - You lose money in pyramid schemes',mix:'"Recruit 5 people" - Pyramid scheme වල මුදල් නැති වෙනවා'},example:"Join our team! Recruit 5 friends and earn Rs.50,000 monthly!"},
    {cat:"gov",title:{si:"Tax Scams",en:"Tax Scams",mix:"Tax Scams"},desc:{si:'"IRD case against you" - රජය ආයතන phone හරහා මුදල් ඉල්ලන්නේ නැත',en:'"IRD case" - Government agencies never ask money via phone',mix:'"IRD case" - රජය ආයතන phone හරහා මුදල් ඉල්ලන්නේ නැත'},example:"This is Inland Revenue. Pay Rs.25,000 tax arrears immediately."},
    {cat:"online",title:{si:"Online Shopping Scams",en:"Online Shopping Scams",mix:"Online Shopping Scams"},desc:{si:'Facebook/Instagram ads වලින් මිල අඩු products - භාණ්ඩ එන්නේ නැත',en:'Cheap products from social media ads - never arrive',mix:'Facebook/Instagram ads වලින් මිල අඩු products - භාණ්ඩ එන්නේ නැත'},example:"iPhone 15 Pro Max - Only Rs.15,000! Limited stock!"},
    {cat:"phone",title:{si:"Missed Call Scams",en:"Missed Call Scams",mix:"Missed Call Scams"},desc:{si:'Unknown numbers වලින් missed calls - call back කළොත් මුදල් වැය වෙනවා',en:'Missed calls from unknown numbers - calling back costs money',mix:'Unknown numbers වලින් missed calls - call back කළොත් මුදල් වැය වෙනවා'},example:"+882 567890 - Missed call from unknown international number"},
    {cat:"social",title:{si:"Fake Giveaways",en:"Fake Giveaways",mix:"Fake Giveaways"},desc:{si:'"Like, Share, Win" - කිසිදා ත්‍යාග නොදෙන contests',en:'"Like, Share, Win" - These are never real giveaways',mix:'"Like, Share, Win" - කිසිදා ත්‍යාග නොදෙන contests'},example:"Like & Share to win a brand new car! Winner announced Friday!"},
    {cat:"money",title:{si:"Gold Investment Fraud",en:"Gold Investment Fraud",mix:"Gold Investment Fraud"},desc:{si:'"Buy gold at 30% discount" - fake gold companies වලින් සොරකම් කරනවා',en:'"Buy gold at 30% discount" - Fake gold companies steal money',mix:'"Buy gold at 30% discount" - fake gold companies වලින් සොරකම් කරනවා'},example:"Invest in gold with us! Guaranteed 40% returns in 6 months!"},
    {cat:"online",title:{si:"Subscription Traps",en:"Subscription Traps",mix:"Subscription Traps"},desc:{si:'"Free trial" - card details දුන්නම සෑම මාසයකම මුදල් කැපෙනවා',en:'"Free trial" - Once you give card details, they charge monthly',mix:'"Free trial" - card details දුන්නම සෑම මාසයකම මුදල් කැපෙනවා'},example:"Try our VPN free for 7 days! (Auto-bills Rs.5000/month after)"},
    {cat:"phone",title:{si:"SIM Swap Scams",en:"SIM Swap Scams",mix:"SIM Swap Scams"},desc:{si:'"Your SIM will be blocked" - ඔබේ SIM card අනුකූලනය කරනවා',en:'"Your SIM will be blocked" - They clone your SIM card',mix:'"Your SIM will be blocked" - ඔබේ SIM card අනුකූලනය කරනවා'},example:"Dialog: Your SIM will be deactivated. Reply with your NIC to verify."},
    {cat:"social",title:{si:"Dating App Scams",en:"Dating App Scams",mix:"Dating App Scams"},desc:{si:'Tinder, Bumble වගේ apps වලින් මුදල් ඉල්ලනවා',en:'Dating apps used to build trust then ask for money',mix:'Tinder, Bumble වගේ apps වලින් මුදල් ඉල්ලනවා'},example:"I really like you. Can you send me Rs.5000 for my phone bill?"},
    {cat:"online",title:{si:"Browser Extension Scams",en:"Browser Extension Scams",mix:"Browser Extension Scams"},desc:{si:'"Useful extensions" - ඔබේ browsing data steal කරනවා',en:'"Useful extensions" - They steal your browsing data',mix:'"Useful extensions" - ඔබේ browsing data steal කරනවා'},example:"Install this extension to speed up your browser by 300%!"},
    {cat:"gov",title:{si:"Passport / Visa Scams",en:"Passport / Visa Scams",mix:"Passport / Visa Scams"},desc:{si:'"Fast visa processing" - fake agents මුදල් අය කරනවා',en:'"Fast visa processing" - Fake agents charge money',mix:'"Fast visa processing" - fake agents මුදල් අය කරනවා'},example:"Get your US visa in 3 days! Only Rs.200,000!"},
    {cat:"money",title:{si:"Pig Butchering Scam",en:"Pig Butchering Scam",mix:"Pig Butchering Scam"},desc:{si:'"Investment platform" හදලා ක්‍රමයෙන් සියල්ම මුදල් අහිමි කරනවා',en:'Build trust on fake platform then steal everything',mix:'"Investment platform" හදලා ක්‍රමයෙන් සියල්ම මුදල් අහිමි කරනවා'},example:"I make Rs.100K daily on this platform. Let me show you how!"},
    {cat:"online",title:{si:"Wi-Fi Hacking",en:"Wi-Fi Hacking",mix:"Wi-Fi Hacking"},desc:{si:'"Free Public Wi-Fi" - ඔබේ data capture කරනවා',en:'"Free Public Wi-Fi" - They capture your data',mix:'"Free Public Wi-Fi" - ඔබේ data capture කරනවා'},example:"Free Airport WiFi - No password needed! Connect now!"},
    {cat:"social",title:{si:"Fake Friend Requests",en:"Fake Friend Requests",mix:"Fake Friend Requests"},desc:{si:'දන්නා අයගෙන් fake requests - මුදල් ඉල්ලනවා',en:'Fake requests from people you know - Then ask for money',mix:'දන්නා අයගෙන් fake requests - මුදල් ඉල්ලනවා'},example:"Hi, this is my new account. My old one got hacked. Send me Rs.2000?"},
    {cat:"money",title:{si:"Loan Scams",en:"Loan Scams",mix:"Loan Scams"},desc:{si:'"Instant loan, no documents" - පළමුව processing fee ඉල්ලනවා',en:'"Instant loan, no documents" - They ask for processing fee first',mix:'"Instant loan, no documents" - පළමුව processing fee ඉල්ලනවා'},example:"Get Rs.500,000 loan instantly! Just pay Rs.5000 processing fee."},
    {cat:"online",title:{si:"WhatsApp Phishing Links",en:"WhatsApp Phishing Links",mix:"WhatsApp Phishing Links"},desc:{si:'WhatsApp groups වල fake links share කරනවා',en:'Fake links shared in WhatsApp groups',mix:'WhatsApp groups වල fake links share කරනවා'},example:"[IMPORTANT] Click here to verify your WhatsApp account security!"},
    {cat:"phone",title:{si:"One-Ring Scams",en:"One-Ring Scams",mix:"One-Ring Scams"},desc:{si:'එක ring ගහනවා - call back කළොත් premium rate number එකක්',en:'One ring then hang up - Calling back costs premium rates',mix:'එක ring ගහනවා - call back කළොත් premium rate number එකක්'},example:"+232 456789 - Rings once and disconnects"},
    {cat:"social",title:{si:"Inheritance Scams",en:"Inheritance Scams",mix:"Inheritance Scams"},desc:{si:'"You inherited millions" - පළමුව transfer fee ඉල්ලනවා',en:'"You inherited millions" - They ask for transfer fee first',mix:'"You inherited millions" - පළමුව transfer fee ඉල්ලනවා'},example:"A wealthy relative left you $5 million. Pay $500 for legal fees."},
    {cat:"online",title:{si:"Malware Downloads",en:"Malware Downloads",mix:"Malware Downloads"},desc:{si:'"Free software" - malware install වෙනවා',en:'"Free software" downloads contain malware',mix:'"Free software" - malware install වෙනවා'},example:"Download MS Office 2024 full version free! No activation needed!"},
    {cat:"money",title:{si:"Stock Tips Scams",en:"Stock Tips Scams",mix:"Stock Tips Scams"},desc:{si:'"Guaranteed stock tips" - paid group වලට join කරන්න කියනවා',en:'"Guaranteed stock tips" - They want you to join paid groups',mix:'"Guaranteed stock tips" - paid group වලට join කරන්න කියනවා'},example:"Predicted 10 stocks correctly! Join VIP group Rs.10,000/month."},
    {cat:"gov",title:{si:"Scholarship Scams",en:"Scholarship Scams",mix:"Scholarship Scams"},desc:{si:'"Free scholarship" - processing fee ඉල්ලනවා',en:'"Free scholarship" - They ask for processing fee',mix:'"Free scholarship" - processing fee ඉල්ලනවා'},example:"You won a Rs.500,000 scholarship. Pay Rs.5000 to claim."},
    {cat:"online",title:{si:"Domain Spoofing",en:"Domain Spoofing",mix:"Domain Spoofing"},desc:{si:'Real domains වගේ fake domains - හරියට බලන්න',en:'Fake domains that look real - Check carefully',mix:'Real domains වගේ fake domains - හරියට බලන්න'},example:"www.dialog.lk-update.com (fake - real is dialog.lk)"},
    {cat:"social",title:{si:"Hacked Account Blackmail",en:"Hacked Account Blackmail",mix:"Hacked Account Blackmail"},desc:{si:'යහළුවෙක්ගේ account hack කරලා ඔබව blackmail කරනවා',en:"Hack friend's account and blackmail you with your data",mix:'යහළුවෙක්ගේ account hack කරලා ඔබව blackmail කරනවා'},example:"I have your private photos. Pay Rs.50,000 or I will share them."},
    {cat:"money",title:{si:"Real Estate Scams",en:"Real Estate Scams",mix:"Real Estate Scams"},desc:{si:'"Cheap land/house" - මුදල් ගෙවලා අයෙක් නැති වෙනවා',en:'"Cheap land/house" - After payment, seller disappears',mix:'"Cheap land/house" - මුදල් ගෙවලා අයෙක් නැති වෙනවා'},example:"Beachfront land Rs.500,000 per perch! Only 5 left!"},
    {cat:"online",title:{si:"Account Recovery Scams",en:"Account Recovery Scams",mix:"Account Recovery Scams"},desc:{si:'"Recover hacked account" - ඔබේ passwords steal කරනවා',en:'"Recover hacked account" - They steal your passwords',mix:'"Recover hacked account" - passwords steal කරනවා'},example:"Facebook hacked? We can recover it! Send your login details."},
    {cat:"phone",title:{si:"AI Voice Cloning",en:"AI Voice Cloning",mix:"AI Voice Cloning"},desc:{si:"AI මගින් ඥාතීන්ගේ ස්වරය copy කරලා call කරනවා",en:"AI clones your relative's voice and calls you",mix:"AI මගින් ඥාතීන්ගේ ස්වරය copy කරලා call කරනවා"},example:"(Voice like your son) Mom, I had an accident. Send Rs.100,000."},
    {cat:"money",title:{si:"Ponzi Schemes",en:"Ponzi Schemes",mix:"Ponzi Schemes"},desc:{si:'"Old investors pay new investors" - අවසානයේ සියල්ලන්ට මුදල් නැති වෙනවා',en:'"Old investors pay new investors" - Everyone eventually loses',mix:'"Old investors pay new investors" - අවසානයේ සියල්ලන්ට මුදල් නැති වෙනවා'},example:"Join our investment! Early investors get 20% monthly returns!"},
    {cat:"online",title:{si:"URL Shortener Scams",en:"URL Shortener Scams",mix:"URL Shortener Scams"},desc:{si:'bit.ly links - සැබෑ URL එක පෙන්නන්නේ නැත',en:'bit.ly links - You cannot see the real destination',mix:'bit.ly links - සැබෑ URL එක පෙන්නන්නේ නැත'},example:"Check this offer: bit.ly/3xK9mZ2 (leads to phishing site)"},
    {cat:"social",title:{si:"Live Stream Scams",en:"Live Stream Scams",mix:"Live Stream Scams"},desc:{si:'"Live giveaway" - real time වල scam කරනවා',en:'"Live giveaway" - Scamming people in real time',mix:'"Live giveaway" - real time වල scam කරනවා'},example:"LIVE: Giving away Rs.100,000! Send Rs.1000 to enter!"},
    {cat:"money",title:{si:"Insurance Scams",en:"Insurance Scams",mix:"Insurance Scams"},desc:{si:'"Fake insurance policies" - premium ගෙවලා claim කරන්න දෙන්නේ නැත',en:'"Fake insurance" - They take premiums but never pay claims',mix:'"Fake insurance" - premium ගෙවලා claim කරන්න දෙන්නේ නැත'},example:"Get full life insurance for just Rs.500/month! No medical checkup!"},
    {cat:"online",title:{si:"Screen Mirroring Scams",en:"Screen Mirroring Scams",mix:"Screen Mirroring Scams"},desc:{si:'"Share your screen" කියලා OTP සහ passwords steal කරනවා',en:'"Share your screen" - They steal OTP and passwords',mix:'"Share your screen" කියලා OTP සහ passwords steal කරනවා'},example:"Bank support: Please share your screen so we can fix your issue."},
    {cat:"phone",title:{si:"Wangiri Scams",en:"Wangiri Scams",mix:"Wangiri Scams"},desc:{si:'ජාත්‍යන්තර numbers වලින් එක ring - call back කළොත් මුදල් වැයේ',en:'International numbers ring once - Calling back costs money',mix:'ජාත්‍යන්තර numbers වලින් එක ring - call back කළොත් මුදල් වැයේ'},example:"+243 987654 - Rings once from unknown country code"}
];

// ========== RENDER SCAMS ==========
function getScamIcon(cat) {
    var icons = {
        phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
        online: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
        social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        gov: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    };
    return icons[cat] || icons['online'];
}

function renderScams() {
    var container = document.getElementById('scams-container');
    if (!container) return;
    var search = document.getElementById('scam-search');
    var query = search ? search.value.toLowerCase() : '';

    var html = '';
    scamsData.forEach(function(scam, i) {
        if (currentFilter !== 'all' && scam.cat !== currentFilter) return;
        var t = scam.title[currentLang] || scam.title['mix'];
        var d = scam.desc[currentLang] || scam.desc['mix'];
        if (query && t.toLowerCase().indexOf(query) === -1 && d.toLowerCase().indexOf(query) === -1 && scam.example.toLowerCase().indexOf(query) === -1) return;
        html += '<div class="scam-card" data-cat="' + scam.cat + '">' +
            '<div class="scam-card-header">' + getScamIcon(scam.cat) + '<h4>' + t + '</h4></div>' +
            '<p>' + d + '</p>' +
            '<div class="scam-example">' + scam.example + '</div>' +
            '</div>';
    });

    if (!html) {
        html = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">No scams found</div>';
    }
    container.innerHTML = html;
    document.getElementById('stat-scams').textContent = scamsData.length + '+';
}

function setScamFilter(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    renderScams();
}

function filterScams() { renderScams(); }

// ========== RED FLAGS ==========
var redFlagsData = [
    {icon:"\u26A0\uFE0F",text:{si:"බොරු URL එකක් ඇත",en:"Fake URL",mix:"බොරු URL එකක් ඇත"},desc:{si:"faceb00k.com, paypa1.com වගේ URLs හරියට බලන්න",en:"Check for misspelled URLs like faceb00k.com",mix:"faceb00k.com, paypa1.com වගේ URLs හරියට බලන්න"}},
    {icon:"\u23F0",text:{si:"ඉක්මන් ක්‍රියා කරන්න කියනවා",en:"Urgency / Pressure",mix:"ඉක්මන් ක්‍රියා කරන්න කියනවා"},desc:{si:"\"24 hours ඇතුළේ\" කියලා බිය ගුලු කරනවා",en:"\"Within 24 hours\" - creating fear and urgency",mix:"\"24 hours ඇතුළේ\" කියලා බිය ගුලු කරනවා"}},
    {icon:"\uD83D\uDCB8",text:{si:"මුදල් / OTP ඉල්ලනවා",en:"Asking for Money / OTP",mix:"මුදල් / OTP ඉල්ලනවා"},desc:{si:"කිසිම legitimate service එකක් OTP හරහා මුදල් ඉල්ලන්නේ නැත",en:"No legitimate service asks for OTP or money via messages",mix:"කිසිම legitimate service එකක් OTP හරහා මුදල් ඉල්ලන්නේ නැත"}},
    {icon:"\uD83D\uDCF1",text:{si:"WhatsApp හරහා official messages",en:"Official Messages via WhatsApp",mix:"WhatsApp හරහා official messages"},desc:{si:"බැංකු, CEB, IRD කිසිදා WhatsApp හරහා messages යවන්නේ නැත",en:"Banks, CEB, IRD never send messages via WhatsApp",mix:"බැංකු, CEB, IRD කිසිදා WhatsApp හරහා messages යවන්නේ නැත"}},
    {icon:"\uD83C\uDFAF",text:{si:"තරඟයකට සහභාගී නොවූ ත්‍යාග",en:"Prizes Without Participation",mix:"තරඟයකට සහභාගී නොවූ ත්‍යාග"},desc:{si:"කිසිදා කිසිමෝ තරඟයකට සහභාගී නොවී ත්‍යාග දිනන්නේ නැත",en:"You cannot win a prize without participating in anything",mix:"කිසිදා තරඟයකට සහභාගී නොවී ත්‍යාග දිනන්නේ නැත"}},
    {icon:"\uD83D\uDD0D",text:{si:"Grammar / Spelling දෝෂ",en:"Grammar / Spelling Errors",mix:"Grammar / Spelling දෝෂ"},desc:{si:"Official messages වල spelling mistakes බහුල වෙන්නේ නැත",en:"Official messages rarely have spelling mistakes",mix:"Official messages වල spelling mistakes බහුල වෙන්නේ නැත"}},
    {icon:"\u2728",text:{si:"අවිශ්‍යයෙන් වැඩි returns කියනවා",en:"Unrealistic Returns",mix:"අවිශ්‍යයෙන් වැඩි returns කියනවා"},desc:{si:"\"100% guaranteed\", \"double your money\" - මේවා scam indicators",en:"\"100% guaranteed\", \"double money\" - These are scam indicators",mix:"\"100% guaranteed\", \"double money\" - මේවා scam indicators"}},
    {icon:"\uD83D\uDCE7",text:{si:"අනාරක්ෂිත email addresses",en:"Suspicious Email Addresses",mix:"අනාරක්ෂිත email addresses"},desc:{si:"support@bank-verify123.com වගේ fake email addresses",en:"Fake email addresses like support@bank-verify123.com",mix:"support@bank-verify123.com වගේ fake email addresses"}},
    {icon:"\uD83D\uDD12",text:{si:"HTTPS / Lock icon නැත",en:"No HTTPS / Lock Icon",mix:"HTTPS / Lock icon නැත"},desc:{si:"Sensitive sites වල lock icon නැත්නම එය scam විය හැක",en:"If a sensitive site has no lock icon, it could be a scam",mix:"Sensitive sites වල lock icon නැත්නම scam විය හැක"}},
    {icon:"\uD83D\uDC64",text:{si:"Sender identity verify කරන්න බැරි",en:"Cannot Verify Sender",mix:"Sender identity verify කරන්න බැරි"},desc:{si:"Sender ගැන තහවුරු නැත්නම එය scam විය හැක",en:"If you cannot verify who sent it, it could be a scam",mix:"Sender ගැන තහවුරු නැත්නම scam විය හැක"}},
    {icon:"\uD83D\uDD04",text:{si:"ස්වයං-ප්‍රධානතාව (Ego) ප්‍රයෝගය කරනවා",en:"Ego / Flattery Manipulation",mix:"ස්වයං-ප්‍රධානතාව (Ego) ප්‍රයෝගය කරනවා"},desc:{si:"\"You are selected\" කියලා ඔබව special කෙනෙක් කරනවා",en:"\"You are selected\" - Making you feel special to trick you",mix:"\"You are selected\" කියලා ඔබව special කෙනෙක් කරනවා"}},
    {icon:"\uD83C\uDF10",text:{si:"Unfamiliar link shorteners",en:"Unfamiliar Link Shorteners",mix:"Unfamiliar link shorteners"},desc:{si:"bit.ly, tinyurl වගේ links click කරන්න එපාවිනි",en:"Avoid clicking bit.ly, tinyurl links from unknown sources",mix:"bit.ly, tinyurl වගේ links click කරන්න එපාවිනි"}}
];

function renderRedFlags() {
    var container = document.getElementById('redflags-container');
    if (!container) return;
    var html = '';
    redFlagsData.forEach(function(flag) {
        var t = flag.text[currentLang] || flag.text['mix'];
        var d = flag.desc[currentLang] || flag.desc['mix'];
        html += '<div class="red-flag">' +
            '<span class="red-flag-icon">' + flag.icon + '</span>' +
            '<div><div class="red-flag-text">' + t + '</div>' +
            '<div class="red-flag-desc">' + d + '</div></div></div>';
    });
    container.innerHTML = html;
}

// ========== COMPARE ==========
var compareData = [
    {
        fakeUrl: "www.faceb00k-login.com",
        realUrl: "www.facebook.com",
        fakeText: {si:"අකුරු වෙනස් කර ඇත - 'oo' වෙනුවට '00'", en:"Misspelled domain - 'oo' replaced with '00'", mix:"අකුරු වෙනස් කර ඇත - 'oo' වෙනුවට '00'"},
        realText: {si:"Correct spelling, HTTPS lock icon ඇත", en:"Correct spelling, has HTTPS lock icon", mix:"Correct spelling, HTTPS lock icon ඇත"}
    },
    {
        fakeUrl: "+94 77 123 4567 (personal number)",
        realUrl: "Official bank hotline only",
        fakeText: {si:"Personal number එකකින් call එනවා", en:"Calling from a personal number", mix:"Personal number එකකින් call එනවා"},
        realText: {si:"Official hotline numbers පමණයි භාවිතා කරන්නේ", en:"Only official hotline numbers are used", mix:"Official hotline numbers පමණයි භාවිතා කරන්නේ"}
    },
    {
        fakeUrl: "\"Your account BLOCKED! Click NOW!\"",
        realUrl: "\"Please verify your recent activity\"",
        fakeText: {si:"ALL CAPS, exclamation marks, urgency create කරනවා", en:"ALL CAPS, exclamation marks, creates urgency", mix:"ALL CAPS, exclamation marks, urgency create කරනවා"},
        realText: {si:"Polite tone, no pressure, reasonable language", en:"Polite tone, no pressure, reasonable language", mix:"Polite tone, no pressure, reasonable language"}
    },
    {
        fakeUrl: "bit.ly/3xK9mZ2",
        realUrl: "https://www.dialog.lk/myaccount",
        fakeText: {si:"URL shortener භාවිතා කරලා සැබෑ URL සඟවලා", en:"URL shortener used to hide real destination", mix:"URL shortener භාවිතා කරලා සැබෑ URL සඟවලා"},
        realText: {si:"Full URL එක පෙන්නනවා, HTTPS secure ඇත", en:"Full URL visible, HTTPS secure", mix:"Full URL එක පෙන්නනවා, HTTPS secure ඇත"}
    },
    {
        fakeUrl: "support@boc-verify-update.com",
        realUrl: "noreply@boc.lk",
        fakeText: {si:"Fake domain name - 'boc.lk' නෙමේය", en:"Fake domain - not 'boc.lk'", mix:"Fake domain name - 'boc.lk' නෙමේය"},
        realText: {si:"Official domain 'boc.lk' භාවිතා කරයි", en:"Uses official domain 'boc.lk'", mix:"Official domain 'boc.lk' භාවිතා කරයි"}
    }
];

function renderCompare() {
    var container = document.getElementById('compare-container');
    if (!container) return;
    var html = '';
    compareData.forEach(function(item) {
        var ft = item.fakeText[currentLang] || item.fakeText['mix'];
        var rt = item.realText[currentLang] || item.realText['mix'];
        html += '<div class="compare-row">' +
            '<div class="compare-item fake">' +
            '<span class="compare-tag fake-tag">FAKE</span>' +
            '<div class="compare-text">' + ft + '</div>' +
            '<div class="compare-url fake-url">' + item.fakeUrl + '</div>' +
            '</div>' +
            '<div class="compare-item real">' +
            '<span class="compare-tag real-tag">REAL</span>' +
            '<div class="compare-text">' + rt + '</div>' +
            '<div class="compare-url real-url">' + item.realUrl + '</div>' +
            '</div></div>';
    });
    container.innerHTML = html;
}

// ========== CHECKLIST ==========
var checklistData = [
    {si:"සියලුම Passwords අලුතින් හදා ඇත",en:"All passwords are strong and unique",mix:"සියලුම Passwords අලුතින් හදා ඇත"},
    {si:"2FA (Two Factor Auth) සක්‍රීය කර ඇත",en:"2FA (Two Factor Auth) is enabled",mix:"2FA (Two Factor Auth) සක්‍රීය කර ඇත"},
    {si:"Unknown links click නොකරනවා",en:"Do not click unknown links",mix:"Unknown links click නොකරනවා"},
    {si:"Unknown QR codes scan නොකරනවා",en:"Do not scan unknown QR codes",mix:"Unknown QR codes scan නොකරනවා"},
    {si:"OTP කිසිමෙකුට දෙන්නේ නැත",en:"Never share OTP with anyone",mix:"OTP කිසිමෙකුට දෙන්නේ නැත"},
    {si:"Phone එකේ antivirus app ඇත",en:"Antivirus app installed on phone",mix:"Phone එකේ antivirus app ඇත"},
    {si:"Bank app එක official store එකෙන් බාගෙන ඇත",en:"Bank app downloaded from official store",mix:"Bank app official store එකෙන් බාගෙන ඇත"},
    {si:"Social media privacy settings සකස් කර ඇත",en:"Social media privacy settings configured",mix:"Social media privacy settings සකස් කර ඇත"},
    {si:"Wi-Fi auto-connect disable කර ඇත",en:"Wi-Fi auto-connect is disabled",mix:"Wi-Fi auto-connect disable කර ඇත"},
    {si:"Scam messages ගැන දන්නවා",en:"Educated about scam messages",mix:"Scam messages ගැන දන්නවා"}
];

function renderChecklist() {
    var container = document.getElementById('checklist-container');
    if (!container) return;
    var html = '';
    checklistData.forEach(function(item, i) {
        var label = item[currentLang] || item['mix'];
        var checked = checkedItems.has(i) ? ' checked' : '';
        html += '<div class="checklist-item' + checked + '" onclick="toggleCheck(' + i + ')">' +
            '<div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>' +
            '<span class="check-label">' + label + '</span></div>';
    });
    container.innerHTML = html;
    updateProgress();
}

function toggleCheck(index) {
    if (checkedItems.has(index)) {
        checkedItems.delete(index);
    } else {
        checkedItems.add(index);
    }
    renderChecklist();
}

function updateProgress() {
    var total = checklistData.length;
    var done = checkedItems.size;
    var pct = Math.round((done / total) * 100);
    var pctEl = document.getElementById('checklist-pct');
    var fillEl = document.getElementById('checklist-fill');
    if (pctEl) pctEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
}

// ========== QUIZ ==========
var quizData = [
    {
        q:{si:"බැංකුවක් WhatsApp හරහා OTP ඉල්ලුවොත් කරන්න කියන්නේ?",en:"What should you do if a bank asks for OTP via WhatsApp?",mix:"බැංකුවක් WhatsApp හරහා OTP ඉල්ලුවොත් කරන්න කියන්නේ?"},
        opts:[
            {si:"OTP දෙන්න",en:"Give the OTP",mix:"OTP දෙන්න"},
            {si:"බැංකුවට කතා කරන්න",en:"Call the bank directly",mix:"බැංකුවට කතා කරන්න"},
            {si:"Message එක reply කරන්න",en:"Reply to the message",mix:"Message එක reply කරන්න"},
            {si:"Link එක click කරන්න",en:"Click the link",mix:"Link එක click කරන්න"}
        ],
        correct:1,
        explain:{si:"බැංකු කිසිදා WhatsApp හරහා OTP ඉල්ලන්නේ නැත. වහාම නිල නම්බර් එකෙන් කතා කරන්න.",en:"Banks never ask for OTP via WhatsApp. Always call the official number.",mix:"බැංකු කිසිදා WhatsApp හරහා OTP ඉල්ලන්නේ නැත. වහාම නිල නම්බර් එකෙන් කතා කරන්න."}
    },
    {
        q:{si:"'50GB Free Data' message එකක් දුටුණොත්?",en:"What if you see a '50GB Free Data' message?",mix:"'50GB Free Data' message එකක් දුටුණොත්?"},
        opts:[
            {si:"Click කරන්න",en:"Click it",mix:"Click කරන්න"},
            {si:"යහළුවන්ට forward කරන්න",en:"Forward to friends",mix:"යහළුවන්ට forward කරන්න"},
            {si:"Delete කරන්න - scam එකක්",en:"Delete it - it is a scam",mix:"Delete කරන්න - scam එකක්"},
            {si:"Link එක save කරන්න",en:"Save the link",mix:"Link එක save කරන්න"}
        ],
        correct:2,
        explain:{si:"Telecom companies කිසිවිටෙකත් WhatsApp හරහා free data offers දෙන්නේ නැත.",en:"Telecom companies never give free data offers via WhatsApp.",mix:"Telecom companies කිසිවිටෙකත් WhatsApp හරහා free data offers දෙන්නේ නැත."}
    },
    {
        q:{si:"Unknown QR code එකක් scan කිරීමෙන් සිදුවිය හැකි දේ මොකක්ද?",en:"What can happen if you scan an unknown QR code?",mix:"Unknown QR code scan කිරීමෙන් සිදුවිය හැකි දේ මොකක්ද?"},
        opts:[
            {si:"මුදල් අයවිය හැකියි",en:"Money could be deducted",mix:"මුදල් අයවිය හැකියි"},
            {si:"ඔබේ phone එකට virus ඇතුලත් වෙයි",en:"Your phone could get a virus",mix:"Phone එකට virus ඇතුලත් වෙයි"},
            {si:"දෙකම සිදුවිය හැකියි",en:"Both are possible",mix:"දෙකම සිදුවිය හැකියි"},
            {si:"කිසිම දෙයක් සිදුවිය නොහැක",en:"Nothing happens",mix:"කිසිම දෙයක් සිදුවිය නොහැක"}
        ],
        correct:2,
        explain:{si:"Unknown QR codes මගින් මුදල් අයවීමට සහ malware install කිරීමට පුළුවන්.",en:"Unknown QR codes can be used to deduct money and install malware.",mix:"Unknown QR codes මගින් මුදල් අයවීමට සහ malware install කිරීමට පුළුවන්."}
    },
    {
        q:{si:"2FA (Two Factor Authentication) යනු මොකක්ද?",en:"What is 2FA (Two Factor Authentication)?",mix:"2FA (Two Factor Authentication) යනු මොකක්ද?"},
        opts:[
            {si:"මුදල් දෙන්න තවත් ක්‍රමයක්",en:"Another way to give money",mix:"මුදල් දෙන්න තවත් ක්‍රමයක්"},
            {si:"Extra security layer එකක්",en:"An extra security layer",mix:"Extra security layer එකක්"},
            {si:"Facebook එකේ feature එකක්",en:"A Facebook feature",mix:"Facebook එකේ feature එකක්"},
            {si:"VPN service එකක්",en:"A VPN service",mix:"VPN service එකක්"}
        ],
        correct:1,
        explain:{si:"2FA යනු password එකට අමතරව phone එකට verify කරන extra security layer එකක්.",en:"2FA is an extra security layer that verifies via phone in addition to password.",mix:"2FA යනු password එකට අමතරව phone verify කරන extra security layer එකක්."}
    },
    {
        q:{si:"'faceb00k.com' URL එකේ ගැටලුව මොකක්ද?",en:"What is wrong with 'faceb00k.com' URL?",mix:"'faceb00k.com' URL එකේ ගැටලුව මොකක්ද?"},
        opts:[
            {si:"අකුරු වෙනස් කර ඇත - 'oo' වෙනුවට '00'",en:"Misspelled - 'oo' replaced with '00'",mix:"අකුරු වෙනස් කර ඇත - 'oo' වෙනුවට '00'"},
            {si:"Nothing wrong",en:"Nothing wrong",mix:"කිසිම ගැටලුවක් නැත"},
            {si:"Too long",en:"Too long",mix:"ලොකු දිගහයි"},
            {si:"HTTPS නැත",en:"No HTTPS",mix:"HTTPS නැත"}
        ],
        correct:0,
        explain:{si:"Fake websites real domains වගේ පෙනෙනවා - අකුරු වෙනස් කරලා. හරියට URL බලන්න.",en:"Fake websites look like real domains - with misspelled letters. Always check the URL.",mix:"Fake websites real domains වගේ පෙනෙනවා - අකුරු වෙනස් කරලා. හරියට URL බලන්න."}
    }
];

function renderQuiz() {
    var container = document.getElementById('quiz-container');
    var resultDiv = document.getElementById('quiz-result');
    if (!container) return;
    quizAnswers = {};
    if (resultDiv) resultDiv.style.display = 'none';

    var html = '';
    quizData.forEach(function(quiz, qi) {
        var qText = quiz.q[currentLang] || quiz.q['mix'];
        html += '<div class="quiz-question" id="quiz-q-' + qi + '">' +
            '<div class="quiz-q-num">' + (currentLang === 'en' ? 'Question ' : 'ප්‍රශ්නය ') + (qi + 1) + '/' + quizData.length + '</div>' +
            '<div class="quiz-q-text">' + qText + '</div>';

        var letters = ['A','B','C','D'];
        quiz.opts.forEach(function(opt, oi) {
            var oText = opt[currentLang] || opt['mix'];
            html += '<div class="quiz-option" onclick="selectAnswer(' + qi + ',' + oi + ')" id="quiz-opt-' + qi + '-' + oi + '">' +
                '<span class="quiz-option-letter">' + letters[oi] + '</span>' +
                '<span>' + oText + '</span></div>';
        });

        html += '<div class="quiz-explanation" id="quiz-exp-' + qi + '"></div></div>';
    });

    html += '<div style="text-align:center;margin-top:1rem;"><button class="share-btn" style="background:linear-gradient(135deg,var(--accent),var(--success))" onclick="submitQuiz()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>' +
        '<span>' + (currentLang === 'en' ? 'Submit Answers' : 'පිළිතුරු බලන්න') + '</span></button></div>';

    container.innerHTML = html;
}

function selectAnswer(qi, oi) {
    if (quizAnswers[qi] !== undefined) return;
    quizAnswers[qi] = oi;

    quizData[qi].opts.forEach(function(opt, i) {
        var el = document.getElementById('quiz-opt-' + qi + '-' + i);
        if (!el) return;
        el.classList.remove('selected');
        if (i === oi) el.classList.add('selected');
    });
}

function submitQuiz() {
    var total = quizData.length;
    var correct = 0;

    quizData.forEach(function(quiz, qi) {
        var userAns = quizAnswers[qi];
        var isCorrect = userAns === quiz.correct;
        if (isCorrect) correct++;

        quiz.opts.forEach(function(opt, oi) {
            var el = document.getElementById('quiz-opt-' + qi + '-' + oi);
            if (!el) return;
            el.classList.remove('selected');
            el.onclick = null;
            if (oi === quiz.correct) el.classList.add('correct');
            if (oi === userAns && !isCorrect) el.classList.add('wrong');
        });

        var expEl = document.getElementById('quiz-exp-' + qi);
        if (expEl) {
            expEl.classList.add('show');
            expEl.classList.remove('correct-exp', 'wrong-exp');
            expEl.classList.add(isCorrect ? 'correct-exp' : 'wrong-exp');
            var eText = quiz.explain[currentLang] || quiz.explain['mix'];
            expEl.textContent = (isCorrect ? '\u2713 ' : '\u2717 ') + eText;
        }
    });

    var pct = Math.round((correct / total) * 100);
    var resultDiv = document.getElementById('quiz-result');
    if (!resultDiv) return;
    resultDiv.style.display = 'block';

    var cls = pct >= 80 ? 'great' : (pct >= 50 ? 'okay' : 'poor');
    var msg = pct >= 80 ? (currentLang === 'en' ? 'Excellent!' : 'ඉතා හොඳයි!') :
              pct >= 50 ? (currentLang === 'en' ? 'Good, but learn more!' : 'හොඳයි, තව ඉගෙනගන්න!') :
              (currentLang === 'en' ? 'You need to learn more!' : 'ඔබ තව ඉගෙනගත්ත් වෙනවා!');

    resultDiv.innerHTML = '<div class="quiz-score ' + cls + '">' + correct + '/' + total + '</div>' +
        '<p style="margin-top:0.5rem;font-size:1.1rem;font-weight:700;">' + msg + '</p>' +
        '<p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-muted);">' + pct + '% ' + (currentLang === 'en' ? 'score' : 'ලකුණුව') + '</p>';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ========== SHARE ==========
function shareOnWhatsApp() {
    var text = currentLang === 'si' ?
        '\u26A0\uFE0F \u0DB8\u0DD9\u0DBA Phishing Awareness Guide \u0D91\u0D9A\u0D9A\u0DCA! \n\n\u0D94\u0DB6 \u0DB6\u0DDC\u0DBB\u0DD4 link \u0D91\u0D9A\u0D9A\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DC0\u0DCF \u0DA2\u0DCF\u0DC0\u0DCF\u0DC4\u0DBD\u0DCF \u0D86\u0DBB\u0DD4 \u0DB4\u0DD2\u0DAF\u0DCA \u0DC3\u0DDC\u0DBB\u0DD4\u0DB1\u0DCA \u0DB1\u0DD2\u0DAF\u0DD4\u0DC0\u0DAD\u0DCA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1! \n\n50+ Scam \u0DC0\u0DBB\u0D9C, Red Flags, Quiz \u0DC3\u0DC4 \u0D86\u0DBB\u0D9A\u0DCA\u0DC2\u0DCF\u0DC4 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DCA \u0D87\u0DAD\u0DD4\u0DBD \u0D91\u0D9A\u0D9A\u0DA7 \u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1!' :
        '\u26A0\uFE0F Phishing Awareness Guide!\n\nYou clicked a fake link! Learn how to spot scams.\n\n50+ Scam types, Red Flags, Quiz & more!\n\nShare to protect your friends!';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function() {
    renderScams();
    renderRedFlags();
    renderCompare();
    renderChecklist();
    renderQuiz();

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.setAttribute('data-theme', 'dark');
    }
});
