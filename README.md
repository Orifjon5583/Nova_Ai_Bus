# Nova_Ai_Bus - Private School Transportation Management System 🚌📍

**Nova Ai Bus** (Nova Maktab Bus) — Xususiy maktab o‘quvchilarini maktabga olib borish va darsdan keyin uyiga xavfsiz yetkazib qo‘yishni boshqaradigan zamonaviy intellektual transport boshqaruv tizimi.

---

## 🌟 Asosiy Xususiyatlar (Key Features)

### 👨‍👩‍👧‍👦 1. Ota-ona Portali (Parent Portal)
- **07:00 Avtomatik Bildirishnoma**: Har kuni ertalab soat 07:00 da "Farzandingiz bugun maktab transportidan foydalanadimi?" so'rovnomasi.
- **Dinamik Marshrut O'zgarishi**: Ota-ona "Yo'q" deb javob bersa, avtobus marshrut chizig'i va bekatlar ro'yxati real-vaqtda ushbu manzilni o'tkazib yuborgan holda qayta optimallashtiriladi.
- **Jonli GPS Map**: Avtobusning xaritadagi real-vaqt joylashuvi va kelish taxminiy vaqti (**ETA**).
- **O'zgarmas Doimiy QR Kod Guvohnomasi**: Har bir o'quvchi uchun 1 marta yaratiladigan unikal va o'zgarmas doimiy QR kod.
- **Telefon GPS Orqali Uy Joylashuvini Belgilash**: Telefon sensori orqali uyni belgilash hamda xaritada tekshirib 100% tasdiqlash wizardi.

### 🚍 2. Haydovchi Interfeysi (Driver View)
- **📱 Telefon Real GPS Sensori (`navigator.geolocation`)**: Haydovchi telefonidagi GPS sensori orqali avtobus joylashuvini real-vaqtda xaritaga uzatish.
- **Katta Sensorli Tugmalar**: Harakat davomida qulay bosish uchun maxsus kattalashtirilgan mobil tugmalar.
- **QR Kod Skaneri**: Kamera orqali o'quvchining doimiy QR kodini skaner qilib avtobusga olish va tushirish.
- **Yuz orqali Aniqlash (Biometric Face Recognition)**: Ota-ona maxfiylik roziligi bilan yuzni taniyish simulyatsiyasi.
- **🚨 SOS Favqulodda Holat Tugmasi**: YTH yoki favqulodda hodisalarda admin paneliga real-vaqt signal yuborish.

### 🏫 3. Maktab Admin Paneli (Admin View)
- **Real-Vaqt Avtopark Xaritasi**: Barcha avtobuslar, tezlik va o'quvchilar uylari markerlari.
- **Doira Ichida Bola Rasmi Bo'lgan Qizil Map Pin**: Xaritalarda har bir o'quvchining o'z rasmi tushirilgan maxsus qizil teardrop map pinlar.
- **O'quvchilar Boshqaruvi va QR Guvohnomani Chop Etish**: O'quvchi guvohnomasini plastik kartochka / beydjik formatida chop etish (`Print ID Card`).
- **Manzilni Tahrirlash va Qayta Belgilash So'rovi**: Ota-ona xato qilganda manzilni tahrirlash hamda qayta belgilash so'rovini yuborish (`Reset Location Request`).
- **Audit Loglar**: Tizimdagi barcha amallarning to'liq tarixi.

---

## 🛠 Texnologiyalar (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Interactive Maps**: Leaflet / React-Leaflet
- **QR Scanning**: `html5-qrcode` & `qrcode.react`
- **Geolocation**: HTML5 Browser Geolocation API (`navigator.geolocation`)

---

## 🚀 Qustirish va Ishga Tushirish (Getting Started)

```bash
# 1. Omborni klonlash (Clone Repository)
git clone https://github.com/Orifjon5583/Nova_Ai_Bus.git
cd Nova_Ai_Bus

# 2. Bog'liqliklarni o'rnatish (Install Dependencies)
npm install

# 3. Dasturni dev rejimida ishga tushirish (Run Development Server)
npm run dev
```

Brauzerda oching: **`http://localhost:3000`**

---

## 🔐 Demotsiya Uchun Login Hisoblar (Demo Accounts)

- **Ota-ona (Parent)**: Tel: `+998905556677` | Parol: `parent123`
- **Haydovchi (Driver)**: Tel: `+998902223344` | Parol: `driver123`
- **Maktab Admini (Admin)**: Tel: `+998901112233` | Parol: `admin123`

---

## 📄 Litsenziya (License)

MIT License © 2026 Nova Ai Bus
