import { useEffect, useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [savedCities, setSavedCities] = useState([]);

  const cities = [
    "Hyderabad", "Karimnagar", "Delhi", "Mumbai", "Chennai",
    "Bangalore", "Kolkata", "Pune", "London", "New York", "Tokyo", 
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedCities") || "[]");
    setSavedCities(stored);
  }, []);

  const getWeather = async (selectedCity = city) => {
    if (!selectedCity.trim()) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=b6414f82ac990a79d07d458d8e904773&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    setWeather(data);
    setSuggestions([]);
  };

  const handleInput = (value) => {
    setCity(value);
    if (value.length > 0) {
      setSuggestions(cities.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setSuggestions([]);
    }
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

        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => handleInput(e.target.value)}
          />
          <button onClick={() => getWeather()}>Search</button>
        </div>

        <div className="suggestions">
          {suggestions.map((item, index) => (
            <p key={index} onClick={() => { setCity(item); getWeather(item); }}>
              📍 {item}
            </p>
          ))}
        </div>

        {!weather && (
          <div className="default-screen">
            <h2>☀️ 🌧 ❄️ ⛅</h2>
            <p>Search any city to view live weather updates</p>
          </div>
        )}

        {weather && weather.main && (
          <div className="weather-card">
            <h2>{weather.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="weather icon"
            />
            <h1>{weather.main.temp}°C</h1>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} km/h</p>
            <button onClick={saveCity}>Save City</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;