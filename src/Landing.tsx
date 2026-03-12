import { useNavigate } from 'react-router-dom'
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiThunderstorm,
} from 'react-icons/wi'
import {
  TbMapPin,
  TbStar,
  TbHistory,
  TbWorldSearch,
  TbShieldCheck,
  TbBolt,
  TbArrowRight,
  TbArrowUpRight,
} from 'react-icons/tb'
import './Landing.css'

const FEATURES = [
  {
    icon: <TbWorldSearch size={28} />,
    title: 'Anlık Veri',
    desc: 'OpenWeatherMap altyapısıyla dünya genelinde 200.000+ şehirde gerçek zamanlı hava bilgisi.',
  },
  {
    icon: <TbMapPin size={28} />,
    title: 'Konum Algılama',
    desc: 'Tek tıkla GPS konumunuzu kullanarak bulunduğunuz noktanın hava durumuna anında ulaşın.',
  },
  {
    icon: <TbStar size={28} />,
    title: 'Favori Şehirler',
    desc: 'Sık takip ettiğiniz şehirleri kaydedin, tek dokunuşla verilerine erişin.',
  },
  {
    icon: <TbHistory size={28} />,
    title: 'Arama Geçmişi',
    desc: 'Önceki aramalarınız otomatik kaydedilir, tekrar yazmanıza gerek kalmaz.',
  },
  {
    icon: <TbShieldCheck size={28} />,
    title: 'Güvenilir Kaynak',
    desc: 'Dünya genelinde milyonlarca kullanıcının güvendiği OpenWeatherMap veritabanı.',
  },
  {
    icon: <TbBolt size={28} />,
    title: 'Hızlı & Hafif',
    desc: 'Vite + React ile inşa edildi. Anında yüklenir, sıfır performans kaybı.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Şehir Gir veya Konum İzni Ver',
    desc: 'Arama kutusuna herhangi bir şehir adını yazın ya da konum butonuna basarak otomatik algılamayı başlatın.',
  },
  {
    num: '02',
    title: 'Anlık Verileri Görüntüle',
    desc: 'Sıcaklık, nem, rüzgar, basınç, görüş mesafesi ve gün doğumu/batımı bilgileri ekrana gelir.',
  },
  {
    num: '03',
    title: 'Favorilere Ekle',
    desc: 'Şehrin yanındaki yıldız ikonuna tıklayarak favorilerinize ekleyin, bir daha aramak zorunda kalmayın.',
  },
]

const STATS = [
  { val: '200K+', label: 'Şehir' },
  { val: '99.9%', label: 'Uptime' },
  { val: '<1s', label: 'Yanıt Süresi' },
  { val: '½s', label: 'Güncelleme' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="lp">
      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="lp-nav" aria-label="Ana navigasyon">
        <span className="lp-logo">WX</span>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Özellikler</a>
          <a href="#how" className="lp-nav-link">Nasıl Çalışır</a>
          <a href="#stats" className="lp-nav-link">Veriler</a>
        </div>
        <button className="lp-cta-sm" onClick={() => navigate('/app')}>
          Uygulamayı Aç <TbArrowUpRight size={14} />
        </button>
      </nav>
      <main id="main-content">
      {/* ── HERO ────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-badge">Gerçek Zamanlı Hava Bilgisi</div>
        <h1 className="lp-hero-title">
          Dünyanın Her Yerinin<br />
          <span className="lp-accent">Hava Durumunu</span> Anında Görün
        </h1>
        <p className="lp-hero-sub">
          200.000+ şehir, anlık veriler ve akıllı konum algısıyla hava durumu takibini<br className="lp-br" />
          en sade ve hızlı haliyle deneyimleyin.
        </p>
        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={() => navigate('/app')}>
            Hemen Başla <TbArrowRight size={18} />
          </button>
          <a href="#features" className="lp-btn-ghost">Özellikleri Keşfet</a>
        </div>
        <div className="lp-hero-weather-strip">
          {[
            { city: 'İstanbul', temp: '18', cond: <WiRain size={22} /> },
            { city: 'Tokyo', temp: '22', cond: <WiDaySunny size={22} /> },
            { city: 'New York', temp: '9', cond: <WiThunderstorm size={22} /> },
            { city: 'Dubai', temp: '38', cond: <WiDaySunny size={22} /> },
            { city: 'Oslo', temp: '-3', cond: <WiSnow size={22} /> },
            { city: 'Sydney', temp: '26', cond: <WiDaySunny size={22} /> },
          ].map(({ city, temp, cond }) => (
            <div key={city} className="lp-strip-item">
              <span className="lp-strip-icon">{cond}</span>
              <span className="lp-strip-city">{city}</span>
              <span className="lp-strip-temp">{temp}°</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section id="stats" className="lp-stats">
        {STATS.map(({ val, label }) => (
          <div key={label} className="lp-stat">
            <span className="lp-stat-val">{val}</span>
            <span className="lp-stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section id="features" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-section-tag">ÖZELLİKLER</span>
          <h2 className="lp-section-title">Tek Sayfada Her Şey</h2>
          <p className="lp-section-sub">Karmaşık arayüzler yok. İhtiyacınız olan tüm veriler, tek ekranda.</p>
        </div>
        <div className="lp-features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="lp-feature-card">
              <span className="lp-feature-icon">{icon}</span>
              <h3 className="lp-feature-title">{title}</h3>
              <p className="lp-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <section id="how" className="lp-section">
        <div className="lp-section-head">
          <span className="lp-section-tag">NASIL ÇALIŞIR</span>
          <h2 className="lp-section-title">Üç Adımda Hazır</h2>
          <p className="lp-section-sub">Kayıt yok, uygulama indirme yok. Tarayıcını aç ve başla.</p>
        </div>
        <div className="lp-steps">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="lp-step">
              <span className="lp-step-num" aria-hidden="true">{num}</span>
              <div className="lp-step-body">
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────── */}
      <section className="lp-banner">
        <div className="lp-banner-inner">
          <h2 className="lp-banner-title">Havaya Hakim Ol</h2>
          <p className="lp-banner-sub">200.000+ şehir. Gerçek zamanlı veriler. Hiçbir şey fazla değil.</p>
          <button className="lp-btn-primary" onClick={() => navigate('/app')}>
            Uygulamayı Başlat <TbArrowRight size={18} />
          </button>
        </div>
        <div className="lp-banner-deco" aria-hidden>
          <WiDaySunny className="lp-deco-icon lp-deco-1" />
          <WiRain className="lp-deco-icon lp-deco-2" />
          <WiSnow className="lp-deco-icon lp-deco-3" />
          <WiThunderstorm className="lp-deco-icon lp-deco-4" />
        </div>
      </section>
      </main>      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="lp-footer">
        <span className="lp-logo">WX</span>
        <span className="lp-footer-copy">© 2026 · OpenWeatherMap verileri kullanılmaktadır.</span>
        <button className="lp-cta-sm" onClick={() => navigate('/app')}>
          Uygulamayı Aç <TbArrowUpRight size={14} />
        </button>
      </footer>
    </div>
  )
}
