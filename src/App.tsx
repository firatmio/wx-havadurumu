import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TbArrowLeft } from 'react-icons/tb'
import { FaArrowRight } from 'react-icons/fa'
import './App.css'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string
const API_BASE = 'https://api.openweathermap.org/data/2.5'
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0'

interface GeoSuggestion {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

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
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [history, setHistory] = useState<string[]>(() => loadStorage('wx-history', []))
  const [favorites, setFavorites] = useState<string[]>(() => loadStorage('wx-favorites', []))
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const savedQueryRef = useRef('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialFetchDone = useRef(false)

  const addToHistory = useCallback((cityName: string) => {
    setHistory(prev => {
      const next = [cityName, ...prev.filter(c => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 8)
      localStorage.setItem('wx-history', JSON.stringify(next))
      return next
    })
  }, [])

  // URL'deki şehri ilk yüklemede fetch et
  useEffect(() => {
    if (initialFetchDone.current) return
    initialFetchDone.current = true
    const cityParam = searchParams.get('city')
    if (cityParam) {
      fetchWeatherData(
        `${API_BASE}/weather?q=${encodeURIComponent(cityParam)}&appid=${API_KEY}&units=metric`
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dışarı tıklanınca dropdown kapat
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  // Debounced geocoding fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = savedQueryRef.current || query
    if (trimmed.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${GEO_BASE}/direct?q=${encodeURIComponent(trimmed.trim())}&limit=6&appid=${API_KEY}`
        )
        if (!res.ok) return
        const data: GeoSuggestion[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        // sessizce yoksay
      }
    }, 280)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const fetchWeatherData = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
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
      navigate(`/app?city=${encodeURIComponent(data.name)}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [addToHistory])

  const fetchWeather = useCallback((city: string) => {
    if (!city.trim()) return
    savedQueryRef.current = ''
    fetchWeatherData(`${API_BASE}/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`)
  }, [fetchWeatherData])

  const selectSuggestion = useCallback((s: GeoSuggestion) => {
    const label = s.state ? `${s.name}, ${s.state}, ${s.country}` : `${s.name}, ${s.country}`
    setQuery(label)
    savedQueryRef.current = ''
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
    fetchWeatherData(`${API_BASE}/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`)
  }, [fetchWeatherData])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = activeIndex < suggestions.length - 1 ? activeIndex + 1 : activeIndex
      if (activeIndex === -1) savedQueryRef.current = query
      setActiveIndex(next)
      setQuery(suggestions[next].name)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (activeIndex <= 0) {
        setActiveIndex(-1)
        setQuery(savedQueryRef.current)
        savedQueryRef.current = ''
      } else {
        const prev = activeIndex - 1
        setActiveIndex(prev)
        setQuery(suggestions[prev].name)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
      if (savedQueryRef.current) {
        setQuery(savedQueryRef.current)
        savedQueryRef.current = ''
      }
    }
  }, [showSuggestions, suggestions, activeIndex, query])

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

        <div className="search-wrap" ref={searchWrapRef}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                selectSuggestion(suggestions[activeIndex])
              } else {
                fetchWeather(query)
              }
            }}
            className="search-form"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                savedQueryRef.current = ''
                setActiveIndex(-1)
                setQuery(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              placeholder="şehir gir..."
              className="search-input"
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            <button type="submit" className="search-btn" disabled={loading} aria-label="Ara">
              {loading ? <span className="search-spinner" /> : <span className="search-arrow"><FaArrowRight size={14} /></span>}
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions" role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.lat}-${s.lon}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`suggestion-item${i === activeIndex ? ' suggestion-item--active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                >
                  <span className="suggestion-name">{s.name}</span>
                  <span className="suggestion-meta">
                    {s.state ? `${s.state} · ` : ''}{s.country}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
