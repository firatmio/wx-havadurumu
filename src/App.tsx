import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbArrowLeft } from 'react-icons/tb'
import './App.css'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string
const API_BASE = 'https://api.openweathermap.org/data/2.5'

interface WeatherData {
  name: string
  sys: { country: string; sunrise: number; sunset: number }
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    humidity: number
    pressure: number
  }
  weather: Array<{ id: number; main: string; description: string }>
  wind: { speed: number; deg: number }
  visibility: number
  clouds: { all: number }
  dt: number
  timezone: number
}

const CONDITION_LABELS: Record<string, string> = {
  Clear: 'AÇIK HAVA',
  Clouds: 'BULUTLU',
  Rain: 'YAĞMURLU',
  Drizzle: 'ÇİSELEME',
  Thunderstorm: 'GÖKGÜRÜLTÜLÜ',
  Snow: 'KARLI',
  Mist: 'SİSLİ',
  Fog: 'YOĞUN SİS',
  Haze: 'PUSLU',
  Smoke: 'DUMANI',
  Dust: 'TOZLU',
  Sand: 'KUMLU',
  Ash: 'KÜLLÜ',
  Squall: 'BORA',
  Tornado: 'TORNADO',
}

const WEATHER_THEMES: Record<string, string> = {
  Clear: 'clear',
  Clouds: 'clouds',
  Rain: 'rain',
  Drizzle: 'rain',
  Thunderstorm: 'storm',
  Snow: 'snow',
  Mist: 'fog',
  Fog: 'fog',
  Haze: 'fog',
  Smoke: 'fog',
}

const WIND_DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB']

function windDir(deg: number) {
  return WIND_DIRS[Math.round(deg / 45) % 8]
}

function localTime(unix: number, offset: number) {
  const d = new Date((unix + offset) * 1000)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function loadStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}

export default function App() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [history, setHistory] = useState<string[]>(() => loadStorage('wx-history', []))
  const [favorites, setFavorites] = useState<string[]>(() => loadStorage('wx-favorites', []))
  const inputRef = useRef<HTMLInputElement>(null)

  const addToHistory = useCallback((cityName: string) => {
    setHistory(prev => {
      const next = [cityName, ...prev.filter(c => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 8)
      localStorage.setItem('wx-history', JSON.stringify(next))
      return next
    })
  }, [])

  const fetchWeatherData = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Şehir bulunamadı.')
        if (res.status === 401) throw new Error('Geçersiz API anahtarı.')
        throw new Error('Bir hata oluştu. Tekrar dene.')
      }
      const data: WeatherData = await res.json()
      setWeather(data)
      setQuery(data.name)
      addToHistory(data.name)
    } catch (err) {
      setError((err as Error).message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [addToHistory])

  const fetchWeather = useCallback((city: string) => {
    if (!city.trim()) return
    fetchWeatherData(`${API_BASE}/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`)
  }, [fetchWeatherData])

  const fetchByLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tarayıcın konum desteklemiyor.')
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLoading(false)
        const { latitude: lat, longitude: lon } = pos.coords
        fetchWeatherData(`${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      },
      () => {
        setLocLoading(false)
        setError('Konum izni reddedildi.')
      }
    )
  }, [fetchWeatherData])

  const toggleFavorite = useCallback((cityName: string) => {
    setFavorites(prev => {
      const exists = prev.some(c => c.toLowerCase() === cityName.toLowerCase())
      const next = exists
        ? prev.filter(c => c.toLowerCase() !== cityName.toLowerCase())
        : [cityName, ...prev]
      localStorage.setItem('wx-favorites', JSON.stringify(next))
      return next
    })
  }, [])

  const theme = weather ? (WEATHER_THEMES[weather.weather[0].main] ?? 'default') : 'default'
  const conditionLabel = weather
    ? (CONDITION_LABELS[weather.weather[0].main] ?? weather.weather[0].main.toUpperCase())
    : null
  const isFavorite = weather
    ? favorites.some(c => c.toLowerCase() === weather.name.toLowerCase())
    : false
  const showPanel = !weather && !loading && !error && (favorites.length > 0 || history.length > 0)

  return (
    <div className={`app theme-${theme}`}>
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Ana sayfaya dön" title="Ana sayfa">
          <TbArrowLeft size={16} />
        </button>
        <span className="logo">WX</span>

        <button
          className={`loc-btn${locLoading ? ' loc-btn--loading' : ''}`}
          onClick={fetchByLocation}
          disabled={locLoading || loading}
          aria-label="Konumumu kullan"
          title="Konumumu kullan"
        >
          {locLoading ? <span className="search-spinner" /> : '◎'}
        </button>

        <form onSubmit={(e) => { e.preventDefault(); fetchWeather(query) }} className="search-form">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="şehir gir..."
            className="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="search-btn" disabled={loading} aria-label="Ara">
            {loading ? <span className="search-spinner" /> : <span className="search-arrow">→</span>}
          </button>
        </form>
      </header>

      <main className="main">
        {!weather && !loading && !error && !showPanel && (
          <div className="idle-state">
            <p className="idle-hint">İstanbul, Tokyo, New York...</p>
          </div>
        )}

        {showPanel && (
          <div className="panel">
            {favorites.length > 0 && (
              <section className="panel-section">
                <h2 className="panel-label">FAVORİLER</h2>
                <ul className="panel-list">
                  {favorites.map(city => (
                    <li key={city} className="panel-item">
                      <button className="panel-city-btn" onClick={() => fetchWeather(city)}>{city}</button>
                      <button className="panel-fav-btn fav-active" onClick={() => toggleFavorite(city)} aria-label="Favoriden çıkar">★</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {history.length > 0 && (
              <section className="panel-section">
                <h2 className="panel-label">GEÇMİŞ</h2>
                <ul className="panel-list">
                  {history.map(city => (
                    <li key={city} className="panel-item">
                      <button className="panel-city-btn" onClick={() => fetchWeather(city)}>{city}</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {error && (
          <div className="idle-state">
            <p className="error-msg">{error}</p>
          </div>
        )}

        {weather && (
          <div className="weather-view">
            <div className="location-bar">
              <h1 className="city">{weather.name}</h1>
              <span className="country">{weather.sys.country}</span>
              <button
                className={`fav-btn${isFavorite ? ' fav-btn--active' : ''}`}
                onClick={() => toggleFavorite(weather.name)}
                aria-label={isFavorite ? 'Favoriden çıkar' : 'Favorilere ekle'}
                title={isFavorite ? 'Favoriden çıkar' : 'Favorilere ekle'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
              <span className="local-time">{localTime(weather.dt, weather.timezone)}</span>
            </div>

            <div className="temp-block">
              <span className="temp-num">{Math.round(weather.main.temp)}</span>
              <div className="temp-side">
                <span className="temp-unit">°C</span>
                <span className="temp-range">
                  {Math.round(weather.main.temp_max)}° / {Math.round(weather.main.temp_min)}°
                </span>
              </div>
            </div>

            <div className="condition-bar">
              <span className="condition">{conditionLabel}</span>
              <span className="desc">{weather.weather[0].description}</span>
            </div>

            <div className="stats">
              <div className="stat-item">
                <span className="stat-val">{weather.main.humidity}%</span>
                <span className="stat-key">nem</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{Math.round(weather.wind.speed * 3.6)} km/s</span>
                <span className="stat-key">rüzgar · {windDir(weather.wind.deg)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{Math.round(weather.main.feels_like)}°</span>
                <span className="stat-key">hissedilen</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{(weather.visibility / 1000).toFixed(1)} km</span>
                <span className="stat-key">görüş</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{weather.main.pressure} hPa</span>
                <span className="stat-key">basınç</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{weather.clouds.all}%</span>
                <span className="stat-key">bulutluluk</span>
              </div>
            </div>

            <div className="sun-row">
              <div className="sun-item">
                <span className="sun-label">GÜN DOĞUMU</span>
                <span className="sun-val">{localTime(weather.sys.sunrise, weather.timezone)}</span>
              </div>
              <div className="sun-sep" />
              <div className="sun-item">
                <span className="sun-label">GÜN BATIMI</span>
                <span className="sun-val">{localTime(weather.sys.sunset, weather.timezone)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
