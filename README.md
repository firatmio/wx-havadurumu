# WX — Hava Durumu

> Minimal, hızlı ve tek sayfalık hava durumu uygulaması.  
> 200.000+ şehir · Gerçek zamanlı veriler · Favori & Geçmiş · Konum algılama

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-d4ff00?style=flat-square)

---

## Önizleme

| Landing | Uygulama |
|---|---|
| Hero, özellikler, adımlar ve CTA bölümleri | Şehir arama, anlık veri kartları |

---

## Özellikler

- **Anlık Hava Durumu** — OpenWeatherMap `data/2.5/weather` API'si ile sıcaklık, nem, rüzgar, basınç, görüş mesafesi, bulutluluk, gün doğumu/batımı
- **Konum Algılama** — Tarayıcı Geolocation API ile tek tıkta otomatik şehir tespiti
- **Favori Şehirler** — `localStorage` ile kalıcı favori listesi, yıldız ikonuyla ekle/çıkar
- **Arama Geçmişi** — Son 8 arama `localStorage`'a kaydedilir, hızlı erişim paneli
- **Hava Teması** — Hava durumuna göre dinamik accent rengi (açık → sarı, yağmur → mavi, fırtına → mor, kar → buz mavisi …)
- **Landing Page** — Tek sayfa kaydırmalı tanıtım; Nav, Hero, Stats, Features, Ticker, How-it-Works, CTA Banner ve Footer
- **Tam Responsive** — 480px'e kadar uyumlu grid ve layout sistemi

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| UI | React 19 + TypeScript 5.9 |
| Build | Vite 8 (beta) |
| Paket Yöneticisi | Bun |
| Routing | React Router DOM 7 |
| İkonlar | React Icons 5 (wi, tb) |
| Stil | Vanilla CSS — token tabanlı tema sistemi |
| API | OpenWeatherMap REST API (Current Weather) |

---

## Başlarken

### Gereksinimler

- [Bun](https://bun.sh) ≥ 1.0 veya Node.js ≥ 18
- OpenWeatherMap API anahtarı ([ücretsiz](https://openweathermap.org/appid))

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/firatmio/wx-havadurumu.git
cd wx-havadurumu

# Bağımlılıkları yükle
bun install

# Geliştirme sunucusunu başlat
bun dev
```

### API Anahtarı

[src/App.tsx](src/App.tsx) dosyasındaki `API_KEY` sabitini kendi anahtarınızla değiştirin:

```ts
const API_KEY = 'BURAYA_API_ANAHTARINIZI_YAZIN'
```

> **Not:** Üretim ortamı için API anahtarını bir `.env` dosyasına taşımanız önerilir.

### Derleme

```bash
# Üretim build
bun run build

# Build önizleme
bun run preview
```

---

## Proje Yapısı

```
weather/
├── src/
│   ├── main.tsx          # Uygulama giriş noktası, router kurulumu
│   ├── App.tsx           # Hava durumu uygulama bileşeni
│   ├── App.css           # Uygulama stilleri (token tabanlı)
│   ├── Landing.tsx       # Landing page bileşeni
│   ├── Landing.css       # Landing page stilleri
│   └── index.css         # Global stiller
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Rotalar

| Rota | Bileşen | Açıklama |
|---|---|---|
| `/` | `Landing` | Tanıtım sayfası |
| `/app` | `App` | Hava durumu uygulaması |

---

## Lisans

Bu proje [MIT](LICENSE) lisansı kapsamında dağıtılmaktadır.


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
