import { useEffect, useState, useCallback } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [savedCities, setSavedCities] = useState(() => 
    JSON.parse(localStorage.getItem("savedCities") || "[]")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFoundCity, setNotFoundCity] = useState(null);
  const [activeStat, setActiveStat] = useState(null);

  const cities = [
    "Hyderabad", "Karimnagar", "Delhi", "Mumbai", "Chennai",
    "Bangalore", "Kolkata", "Pune", "London", "New York", "Tokyo", 
  ];

  const getWeather = useCallback(async (selectedCity = city) => {
    if (!selectedCity.trim()) {
      setError("Please enter a city name");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=b6414f82ac990a79d07d458d8e904773&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        setNotFoundCity(selectedCity);
        setWeather(null);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setWeather(data);
      setSuggestions([]);
      setNotFoundCity(null);
      setCity("");
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (weather && weather.name) {
        getWeather(weather.name);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [weather, getWeather]);

  const handleInput = (value) => {
    setCity(value);
    if (value.length > 0) {
      setSuggestions(cities.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setSuggestions([]);
    }
    // Clear error when user types
    setError(null);
  };

  const saveCity = () => {
    if (!weather?.name) return;
    const name = weather.name;
    if (savedCities.includes(name)) {
      alert("City already saved!");
      return;
    }
    const updated = [...savedCities, name];
    setSavedCities(updated);
    localStorage.setItem("savedCities", JSON.stringify(updated));
    alert(`${name} saved!`);
  };

  const removeCity = (name) => {
    const updated = savedCities.filter((c) => c !== name);
    setSavedCities(updated);
    localStorage.setItem("savedCities", JSON.stringify(updated));
  };

  const loadCity = (name) => {
    setCity(name);
    getWeather(name);
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h3 className="sidebar-title">Saved Cities</h3>
        {savedCities.length === 0 ? (
          <p className="sidebar-empty">No saved cities yet.</p>
        ) : (
          savedCities.map((name) => (
            <div key={name} className="sidebar-city">
              <span onClick={() => loadCity(name)}>📍 {name}</span>
              <button
                className="remove-btn"
                onClick={() => removeCity(name)}
                title="Remove"
              >✕</button>
            </div>
          ))
        )}
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <h1 className="title">🌦 Weather Dashboard</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
          />
          <button onClick={getWeather} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="suggestions">
          {suggestions.map((item, index) => (
            <p key={index} onClick={() => { setCity(item); getWeather(item); }}>
              📍 {item}
            </p>
          ))}
        </div>

        {/* QUICK STAT ICON TILES */}
        <div className="stat-tiles">
          <button
            className={`stat-tile ${activeStat === "sunrise" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "sunrise" ? null : "sunrise")}
            title="Sunrise & Sunset"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 18 15 22 9 22 7 18" />
              <path d="M22 6 20 10 18 4" />
              <path d="M2 6 4 10 6 4" />
              <path d="M12 18c-2.5 0-4.5-1.7-5.2-4" />
              <path d="M12 2c2.5 0 4.5 2 5.2 4" />
              <line x1="2" y1="6" x2="22" y2="6" />
              <line x1="22" y1="6" x2="22" y2="14" />
              <line x1="2" y1="6" x2="2" y2="14" />
            </svg>
            <span>Sun Times</span>
          </button>

          <button
            className={`stat-tile ${activeStat === "humidity" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "humidity" ? null : "humidity")}
            title="Humidity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>Humidity</span>
          </button>

          <button
            className={`stat-tile ${activeStat === "wind" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "wind" ? null : "wind")}
            title="Wind"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9.59 4.59 2 2" />
              <path d="M17 4h4l-4 13H7a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2h8z" />
              <path d="m17 10-4 13" />
            </svg>
            <span>Wind</span>
          </button>

          <button
            className={`stat-tile ${activeStat === "feelsLike" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "feelsLike" ? null : "feelsLike")}
            title="Feels Like"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
            <span>Feels Like</span>
          </button>

          <button
            className={`stat-tile ${activeStat === "visibility" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "visibility" ? null : "visibility")}
            title="Visibility"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Visibility</span>
          </button>

          <button
            className={`stat-tile ${activeStat === "pressure" ? "active" : ""}`}
            onClick={() => setActiveStat(activeStat === "pressure" ? null : "pressure")}
            title="Pressure"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20" />
              <path d="M2 5h20" />
              <path d="M2 19h20" />
              <path d="M4 2h16" />
              <path d="M6 2v20" />
              <path d="M18 2v20" />
            </svg>
            <span>Pressure</span>
          </button>
        </div>

        {/* EXPANDED STAT DETAIL */}
        {activeStat && weather && weather.main && (
          <div className={`stat-detail fadeInUp ${activeStat}`}>
            <button className="close-btn" onClick={() => setActiveStat(null)}>✕</button>
            {activeStat === "sunrise" && (
              <>
                <h3>{new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</h3>
                <p>Sunrise</p>
                <p style={{ marginTop: 32, fontSize: 20, fontWeight: 700 }}>{new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <p>Sunset</p>
              </>
            )}
            {activeStat === "humidity" && (
              <>
                <h3>{weather.main.humidity}%</h3>
                <p>Relative Humidity</p>
              </>
            )}
            {activeStat === "wind" && (
              <>
                <h3>{(weather.wind.speed * 3.6).toFixed(1)} km/h</h3>
                <p>Wind Speed {weather.wind.deg ? `· ${weather.wind.deg}°` : ""}</p>
              </>
            )}
            {activeStat === "feelsLike" && (
              <>
                <h3>{weather.main.feels_like}°C</h3>
                <p>Feels Like Temperature</p>
              </>
            )}
            {activeStat === "visibility" && (
              <>
                <h3>{(weather.visibility / 1000).toFixed(1)} km</h3>
                <p>Visibility</p>
              </>
            )}
            {activeStat === "pressure" && (
              <>
                <h3>{weather.main.pressure.toLocaleString()} hPa</h3>
                <p>Atmospheric Pressure (Sea Level)</p>
              </>
            )}
          </div>
        )}

        {!weather && !loading && !notFoundCity && (
          <div className="default-screen">
            <h2>☀️ 🌧 ❄️ ⛅</h2>
            <p>Search any city to view live weather updates</p>
          </div>
        )}

        {loading && !weather && !notFoundCity && (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {notFoundCity && (
          <div className="not-found-card">
            <h3>📍 {notFoundCity}</h3>
            <p>We do not have data on this location, we will update shortly or as soon as possible</p>
            <button onClick={() => setNotFoundCity(null)}>Close</button>
          </div>
        )}

        {weather && weather.main && (
          <div className="weather-card">
            <button className="close-btn" onClick={() => setWeather(null)} title="Close">✕</button>
            <h2>{weather.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <h1>{weather.main.temp}°C</h1>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {(weather.wind.speed * 3.6).toFixed(1)} km/h</p>
            <button onClick={saveCity}>Save City</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;