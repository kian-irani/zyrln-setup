# 🌐 Zyrln Setup — Free Personal VPN Builder

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)
![Free](https://img.shields.io/badge/cost-100%25%20free-brightgreen)

**یه VPN شخصی رایگان با Cloudflare Workers + Google Apps Script**

[🌐 صفحه راه‌اندازی](https://kian-irani.github.io/zyrln-setup/) · 
[🤖 ربات تلگرام](https://t.me/Zyrln_script_bot) · 
[💬 پشتیبانی](https://t.me/Kian_irani_t)

</div>

---

## 🎯 این چیه؟

یه راهنمای تعاملی + ربات تلگرام که بهت کمک می‌کنه یه **VPN شخصی رایگان** برای مرورگرت بسازی.

**چطوری کار می‌کنه؟**
1. کاربر در [صفحه تعاملی](https://kian-irani.github.io/zyrln-setup/) Token کلودفلر می‌ده
2. سیستم خودکار یه Worker در حساب کلودفلر کاربر می‌سازه
3. کاربر یه Apps Script ساده deploy می‌کنه
4. کانفیگ نهایی JSON برای اپ Zyrln ساخته می‌شه

---

## ✨ مزایا

- 🎁 **کاملاً رایگان** — ۱۰۰هزار درخواست در روز Free Tier کلودفلر
- 🚀 **سرعت خوب** — استفاده از Edge جهانی کلودفلر
- 🔐 **شخصی** — هر کاربر Worker مستقل خودش رو داره
- 🌐 **بدون VPS** — فقط حساب گوگل + کلودفلر
- 📱 **اپ اندروید** — از Zyrln APK رسمی استفاده می‌شه
- 🛠 **منبع‌باز** — کد کامل قابل بررسی

## ⚠️ محدودیت‌ها

- ❌ فقط **مرورگر** (Chrome, Firefox, ...) — نه اپ‌های native
- ❌ اپ‌های Telegram, Instagram native کار نمی‌کنن
- ❌ Full Tunnel نداره
- ⚠️ ChatGPT/Claude گاهی captcha می‌خوان

---

## 🚀 شروع

### روش ۱: صفحه تعاملی
1. برو به https://kian-irani.github.io/zyrln-setup/
2. مراحل قدم‌به‌قدم رو دنبال کن
3. کانفیگ نهایی بگیر

### روش ۲: ربات تلگرام
1. شروع: [@Zyrln_script_bot](https://t.me/Zyrln_script_bot)
2. ربات راهنمایی می‌کنه
3. کانفیگ تحویل بگیر

---

## 🏗 معماری

```
کاربر (موبایل/PC) 
   ↓ مرورگر با پروکسی
🅖 Google Apps Script 
   ↓ relay
☁️ Cloudflare Worker 
   ↓ fetch
🌍 سایت مقصد
```

---

## 🙏 منابع و الهام

این پروژه ترکیبی از چندین پروژه متن‌باز ـه:

### 🌟 منبع اصلی
- **[Zyrln](https://github.com/ajavadinezhad/zyrln)** by @ajavadinezhad
  - اپ اندروید و معماری اصلی Apps Script + Cloudflare Worker
  - کد Apps Script و Worker از این پروژه الهام گرفته شده

### 🌟 الهام
- **[MasterHttpRelayVPN-RUST](https://github.com/therealaleph/MasterHttpRelayVPN-RUST)** by @therealaleph
  - معماری Apps Script relay و domain fronting
  - تکنیک‌های هوشمندانه DNS caching

### 🌟 ابزارها
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — Edge compute platform
- **[Google Apps Script](https://script.google.com/)** — Relay با domain fronting
- **[GitHub Pages](https://pages.github.com/)** — Hosting صفحه

---

## 📁 ساختار ریپو

```
zyrln-setup/
├── index.html              # صفحه اصلی
├── assets/
│   ├── style.css          # استایل
│   └── script.js          # منطق JavaScript
├── README.md
└── LICENSE
```

---

## 🛠 برای توسعه‌دهنده‌ها

این پروژه دو بخش داره:

### 1. Frontend (این ریپو)
- HTML + CSS + JS خالص
- Hosting روی GitHub Pages
- بدون نیاز به build

### 2. Backend (VPS بایج)
- Python aiohttp روی VPS
- CORS proxy برای Cloudflare API
- Stateless — Token کاربر ذخیره نمی‌شه

### Local development
```bash
# Frontend
cd zyrln-setup
python3 -m http.server 8000
# باز کن: http://localhost:8000
```

---

## 🔒 امنیت و حریم خصوصی

- ✅ Token کلودفلر **فقط** برای ساخت Worker استفاده می‌شه
- ✅ Token در سرور ما **ذخیره نمی‌شه** (stateless)
- ✅ بعد از ساخت می‌تونی توکن رو revoke کنی
- ✅ Worker در حساب **خودت** ساخته می‌شه
- ✅ کاربر AUTH_KEY رو می‌بینه و کنترلش رو داره

**ما به این‌ها دسترسی نداریم:**
- ❌ ترافیک تو
- ❌ سایت‌هایی که می‌بینی
- ❌ کلمات عبور

---

## 💝 حمایت

این پروژه کاملاً رایگانه. اگه برات مفید بود می‌تونی حمایت کنی:

- 💝 از طریق [@Zyrln_script_bot](https://t.me/Zyrln_script_bot) (کارت یا ترون)
- ⭐ ستاره دادن به این ریپو
- 🐛 گزارش باگ یا پیشنهاد بهبود

---

## 📜 License

MIT License — استفاده آزاد. فقط credit بده.

---

<div align="center">

ساخته شده با ❤️ توسط [KIAN-IRANI](https://github.com/KIAN-IRANI)

</div>
