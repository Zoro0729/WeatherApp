import { useEffect, useState } from "react";

function App() {

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // LOAD SAVED CITY WHEN APP OPENS
  useEffect(() => {

    const savedCity = localStorage.getItem("savedCity");

    if(savedCity){
      setCity(savedCity);
      getWeather(savedCity);
    }

  }, []);

  // FETCH WEATHER
  const getWeather = async (selectedCity = city) => {

    const url =
      `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=b6414f82ac990a79d07d458d8e904773&units=metric`;

    const response = await fetch(url);

    const data = await response.json();

    setWeather(data);

  };

  // CITY SUGGESTIONS
  const cities = [
    "Hyderabad",
    "Karimnagar",
    "Delhi",
    "Mumbai",
    "Chennai",
    "Bangalore",
    "Kolkata",
    "Pune",
    "London",
    "New York",
    "Tokyo"
  ];

  const handleInput = (value) => {

    setCity(value);

    if(value.length > 0){

      const filtered = cities.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(filtered);

    } else {
      setSuggestions([]);
    }

  };

  // SAVE CITY
  const saveCity = () => {

    localStorage.setItem("savedCity", city);

    alert("City Saved!");

  };

  return (
    <div className="app">

      <h1 className="title">🌦 Weather Dashboard</h1>

      {/* SEARCH AREA */}
      <div className="search-bar">

        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => handleInput(e.target.value)}
        />

        <button onClick={() => getWeather()}>
          Search
        </button>

      </div>

      {/* CITY SUGGESTIONS */}
      <div className="suggestions">

        {suggestions.map((item, index) => (

          <p
            key={index}
            onClick={() => {
              setCity(item);
              setSuggestions([]);
            }}
          >
            📍 {item}
          </p>

        ))}

      </div>

      {/* DEFAULT SCREEN */}
      {!weather && (

        <div className="default-screen">

          <h2>☀️ 🌧 ❄️ ⛅</h2>

          <p>
            Search any city to view live weather updates
          </p>

        </div>

      )}

      {/* WEATHER CARD */}
      {weather && weather.main && (

        <div className="weather-card">

          <h2>{weather.name}</h2>

          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
          />

          <h1>{weather.main.temp}°C</h1>

          <p>Humidity: {weather.main.humidity}%</p>

          <p>Wind Speed: {weather.wind.speed} km/h</p>

          <button onClick={saveCity}>
            Save City
          </button>

        </div>

      )}

    </div>
  );
}

export default App;