# 📱 Phone Hub Store — PWA

A production-ready Progressive Web App for a local mobile phone shop.

## 📁 Folder Structure

```
phone-hub-store/
├── index.html          ← Main app (single page)
├── manifest.json       ← PWA manifest (installable)
├── sw.js               ← Service Worker (offline support)
├── css/
│   └── style.css       ← All styles (dark/light mode)
├── js/
│   ├── data.js         ← Product data + WhatsApp number
│   └── app.js          ← All app logic
├── icons/
│   ├── icon-192.png    ← App icon (home screen)
│   └── icon-512.png    ← App icon (splash screen)
└── README.md           ← This file
```

---

## ⚙️ Setup (5 Minutes)

### 1. Update Your WhatsApp Number
Open `js/data.js` and change line 1:
```js
const WHATSAPP_NUMBER = '919876543210'; // Your number with country code
```
**Example for India:** +91 98765 43210 → `919876543210`

### 2. Update Shop Address & Hours
Open `index.html` and find the "Visit Our Store" section. Update:
- Address
- Phone number
- Business hours

### 3. Add Your Products
**Option A — Edit data.js directly:**
Modify the `SAMPLE_PRODUCTS` array in `js/data.js`.

**Option B — Use Admin Panel:**
1. Open the app → tap ⚙️ → Enter password `phonehub2024`
2. Add/edit products with images, prices, specs
3. Toggle availability when phones are sold

### 4. Change Admin Password
In `js/app.js`, line 11:
```js
const ADMIN_PASSWORD = 'phonehub2024'; // Change this!
```

---

## 🚀 Deployment Options

### Option A — Vercel (Recommended, Free)
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Inside the `phone-hub-store/` folder, run: `vercel`
4. Follow prompts → your site goes live in 60 seconds!
5. You get a free `.vercel.app` URL

### Option B — Firebase Hosting (Free)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. In the project folder:
   ```bash
   firebase init hosting
   # Public directory: . (current folder)
   # Single page app: No
   ```
4. Deploy: `firebase deploy`

### Option C — Netlify (Drag & Drop)
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the entire `phone-hub-store/` folder to the deploy zone
3. Done! Instant free hosting.

### Option D — GitHub Pages (Free)
1. Push the folder to a GitHub repo
2. Go to repo Settings → Pages → Source: main branch
3. Your site: `https://yourusername.github.io/phone-hub-store`

---

## 📲 Making it Installable (PWA)

After deploying to HTTPS:
1. Open the site on mobile Chrome/Safari
2. Tap browser menu → "Add to Home Screen"
3. The app installs like a native app!

---

## 🎨 Customization

### Change Brand Colors
In `css/style.css`, update these CSS variables:
```css
--primary: #2563EB;    /* Main blue */
--accent: #F59E0B;     /* Yellow accent */
```

### Add Product Images
- Use any direct image URL (from Flipkart, Amazon, manufacturer sites)
- Or upload images to [imgbb.com](https://imgbb.com) (free) and use the direct link
- Or use Google Drive: share image → get direct link

---

## 💡 Features Summary

| Feature | Status |
|---------|--------|
| Product listing with filters | ✅ |
| Search bar | ✅ |
| Product detail with specs | ✅ |
| WhatsApp "Check Availability" | ✅ |
| Dark mode / Light mode | ✅ |
| Admin panel (add/edit/delete) | ✅ |
| Hot Deals tag | ✅ |
| Battery health bar (iPhone) | ✅ |
| PWA — installable on mobile | ✅ |
| Offline support | ✅ |
| Customer reviews section | ✅ |
| Contact info section | ✅ |
| Mobile-first design | ✅ |
| Lazy loading images | ✅ |

---

## 📦 No Server Required

All product data is stored in the browser's `localStorage`. This means:
- ✅ Zero hosting cost for backend
- ✅ Works offline
- ✅ Instantly fast
- ⚠️ Data is per-device (admin edits only apply to that device/browser)

**To share inventory across devices** (advanced): 
Consider upgrading to Firebase Firestore — the structure is already ready for it.

---

## 📞 Support

For help with setup, WhatsApp: **+91 98765 43210**

Built with ❤️ for local mobile shops.
