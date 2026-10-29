# 🌿 AeroPlus: Mobile-First Public Air Quality & Environmental Intelligence

**AeroPlus** is a production-ready, mobile-first environmental intelligence platform designed for public presentations, poster sessions, and citizen awareness. Visitors can scan a QR code from a poster or screen and immediately interact with a personalized, AI-powered conversational air-quality companion.

---

## 📱 Features & Information Architecture

1. **💬 Conversational AI Assistant (Primary Screen)**
   - Powered by **Google Gemini** with intelligent fallback to a verified, deterministic offline engine (meaning the app works 100% of the time, even with zero API keys).
   - Natural language comprehension for open-ended queries:
     - *"What's the current AQI in Delhi?"*
     - *"Is it safe to go outside today / for a morning run?"*
     - *"Should I wear an N95 mask?"*
     - *"How does air pollution affect my health?"*
     - *"What can I do to reduce my contribution to air pollution?"*
     - *"What measures are authorities taking under GRAP?"*
   - Returns structured answers: executive summary cards, clear guidance, live AQI snapshots, verified statutory policy citations (CAQM Act 2021, GRAP 2024, GNCTD Mitigation Plan), and dynamic follow-up chips.

2. **📊 Live Air Quality & Telemetry**
   - Real-time observation data via **Open-Meteo Air Quality & Weather API**.
   - Official **Indian CPCB Air Quality Index (AQI)** formula and color spectrum (Good, Satisfactory, Moderate, Poor, Very Poor, Severe).
   - Real-time Criteria Pollutants: **PM2.5, PM10, NO₂, SO₂, CO, O₃** with national 24-hr threshold benchmarks.
   - Atmospheric Stagnation & Weather Drivers: Temperature, Relative Humidity, Wind Speed, and dispersion risk.
   - 24-Hour hourly forecast trajectory and tailored health advice across four citizen categories (General Public, Sensitive Individuals, Children/Elderly, Outdoor Workers).
   - Geolocation support via browser GPS ("Use My Current Location") or dynamic global city search.

3. **💡 Solutions & Civic Intelligence**
   - **What Authorities Are Doing:** Graded Response Action Plan (GRAP 2024 Stages I–IV) explained in clear citizen language.
   - **Citizen Action Center:** 5 practical high-impact steps (Metro transit, zero waste burning, PUC checks, indoor HEPA filtration, green buffers).
   - **Interactive Artificial Tree Lab:** Physics-based simulation calculating daily airflow, PM mass removed, energy consumption, and operating economics. Includes educational scientific bounding explaining localized micro-zone cleaning vs airshed source reduction.

---

## ⚡ Local Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or yarn

### 1. Install Dependencies
```bash
cd aeroplus-public
npm install
```

### 2. Configure Environment Variables (Optional)
The app runs completely offline with full deterministic intelligence and live open-meteo observations without any API keys.

If you want live Gemini conversational reasoning:
```bash
cp .env.example .env.local
```
Open `.env.local` and insert your personal Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Run Locally
```bash
npm run dev
```
Open your browser or phone to:
👉 **`http://localhost:3000`**

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🚀 How to Upload to GitHub

This `aeroplus-public` directory is completely standalone and ready for its own repository:

```bash
# 1. Enter the aeroplus-public directory
cd aeroplus-public

# 2. Initialize a fresh Git repository
git init

# 3. Add all files (the included .gitignore automatically protects secrets and node_modules)
git add .

# 4. Commit
git commit -m "Initial commit: AeroPlus public mobile web app"

# 5. Link to your GitHub repository
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push
git push -u origin main
```

---

## 🌐 1-Click Deployment on Vercel

Vercel natively supports Next.js with zero server configuration.

1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New...** $\to$ **Project**.
3. Select your `aeroplus-public` repository and click **Import**.
4. In the **Environment Variables** section, add your secret keys:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key)*
   - `GEMINI_MODEL`: `gemini-1.5-flash` *(optional, defaults to gemini-1.5-flash)*
   - `GOOGLE_AIR_QUALITY_API_KEY`: *(optional)*
5. Click **Deploy**.
6. In ~60 seconds, your website will be live at `https://<your-project-name>.vercel.app`!

---

## 🏷️ How to Generate the Poster QR Code

1. Once deployed, copy your live Vercel URL (e.g., `https://aeroplus-app.vercel.app`).
2. You can generate a high-resolution QR code using any of the following:
   - **Directly inside the web app:** Click the **QR Code** button in the top navbar on desktop to display the live QR code!
   - **QR Code Monkey / Canva:** Paste your Vercel URL into [qrcode-monkey.com](https://www.qrcode-monkey.com/) to export a print-ready vector PNG/SVG with custom green colors or icons.
3. Place the printed QR code onto your presentation poster so judges and attendees can scan and test the live assistant on their smartphones.

---

## 🔒 Security Guarantee
- No API keys or secret credentials are ever bundled in client-side JavaScript.
- All AI queries and secret-bearing calls are handled through server-side Next.js route handlers (`/api/chat`, `/api/aqi`, `/api/simulate-tree`).
- `.env` and `.env.local` are strictly excluded in `.gitignore`.
