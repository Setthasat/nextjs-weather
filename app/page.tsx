"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./home.css";

type WeatherData = {
  city: string;
  temp: string | number;
  condition: string;
  visibility: string | number;
  humidity: string | number;
  wind: string | number;
  gust: string | number;
};

const conditionCategories: Record<string, string[]> = {
  "Sunny & Clear": ["Sunny", "Clear"],
  "Cloudy & Overcast": ["Partly cloudy", "Cloudy", "Overcast"],
  "Fog & Mist": ["Mist", "Fog", "Freezing fog"],
  "Rain & Drizzle": [
    "Patchy rain possible", "Patchy light drizzle", "Light drizzle", "Freezing drizzle", "Heavy freezing drizzle", 
    "Patchy light rain", "Light rain", "Moderate rain at times", "Moderate rain", "Heavy rain at times", "Heavy rain", 
    "Light freezing rain", "Moderate or heavy freezing rain"
  ],
  "Snow & Blizzard": ["Patchy snow possible", "Blowing snow", "Blizzard", "Patchy light snow", "Light snow", "Patchy moderate snow", "Moderate snow", "Patchy heavy snow", "Heavy snow"],
  "Sleet & Ice Pellets": ["Patchy sleet possible", "Light sleet", "Moderate or heavy sleet", "Ice pellets", "Light showers of ice pellets", "Moderate or heavy showers of ice pellets"],
  "Thunderstorms": ["Thundery outbreaks possible", "Patchy light rain with thunder", "Moderate or heavy rain with thunder", "Patchy light snow with thunder", "Moderate or heavy snow with thunder"],
  "Showers": ["Light rain shower", "Moderate or heavy rain shower", "Torrential rain shower", "Light sleet showers", "Moderate or heavy sleet showers", "Light snow showers", "Moderate or heavy snow showers"],
};

const backgroundImages: Record<string, string> = {
  "Sunny & Clear": "/sunny.jpg",
  "Cloudy & Overcast": "/cloudy.jpg",
  "Fog & Mist": "/fog.jpg",
  "Rain & Drizzle": "/rain.jpg",
  "Snow & Blizzard": "/snow.jpg",
  "Sleet & Ice Pellets": "/sleet.jpg",
  "Thunderstorms": "/thunderstorms.jpg",
  "Showers": "/showers.jpg",
};

const categorizeCondition = (condition: string) => {
  for (const [category, conditions] of Object.entries(conditionCategories)) {
    if (conditions.includes(condition)) {
      return category;
    }
  }
  return "Unknown";
};

const getBackgroundImage = (condition: string) => {
  return backgroundImages[condition] || "/background.jpg";
};

export default function Home() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [background, setBackground] = useState<string>("/background.jpg");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const defaultWeather: WeatherData = {
    city: "City",
    temp: "--",
    condition: "--",
    visibility: "--",
    humidity: "--",
    wind: "--",
    gust: "--",
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const api_key = "991f9bb493b24c85919110257252102";
      const api_url = `http://api.weatherapi.com/v1/search.json?key=${api_key}&q=${query}`;
      const { data } = await axios.get(api_url);
      setSuggestions(data.map((item: any) => item.name));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSuggestions(location);
    }, 300);
    return () => clearTimeout(debounce);
  }, [location]);

  const getWeather = useCallback(async (city?: string) => {
    const query = city || location;
    if (query) {
      try {
        const api_key = "991f9bb493b24c85919110257252102";
        const api_url = `http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${query}`;
        const { data } = await axios.get(api_url);
        const newCondition = categorizeCondition(data.current.condition.text);
        setWeather({
          city: data.location.name,
          temp: data.current.temp_c,
          condition: newCondition,
          visibility: data.current.vis_miles,
          humidity: data.current.humidity,
          wind: data.current.wind_kph,
          gust: data.current.gust_mph,
        });
        setBackground(getBackgroundImage(newCondition));
        setSuggestions([]);
      } catch (err) {
        console.log(err);
      }
    }
  }, [location]);

  const displayWeather = weather || defaultWeather;

  const handleBlur = () => {
    if (location.trim() === "") {
      setTimeout(() => setSuggestions([]), 1);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={background}
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative bg-white bg-opacity-10 backdrop-blur-md p-6 sm:p-10 py-[5rem] w-full sm:w-[38%] max-w-md sm:rounded-2xl shadow-lg text-center">
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={handleBlur}
              className="text-xl font-bold outline-none text-gray-700 text-center w-[80%] h-[4rem] bg-white/30 rounded-full"
              placeholder={displayWeather.city}
            />
            {location.trim() && suggestions.length > 0 && (
              <ul className="absolute bg-white shadow-md rounded-md mt-2 w-[80%] mx-auto text-left">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => { setLocation(suggestion); getWeather(suggestion); }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-[2rem]">
            <p className="text-[2rem]">{displayWeather.temp}°C</p>
            <p className="text-[1.4rem] text-gray-800">{displayWeather.condition}</p>
            <div className="mt-4 text-gray-700 text-[1.2rem] grid grid-cols-2">
              <p>Visibility: {displayWeather.visibility} mi</p>
              <p>Humidity: {displayWeather.humidity}%</p>
              <p>Wind: {displayWeather.wind} km/h</p>
              <p>Gust: {displayWeather.gust} mph</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
