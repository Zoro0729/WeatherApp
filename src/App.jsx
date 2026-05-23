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