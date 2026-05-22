const express = require("express");
const router = express.Router();
const axios = require("axios");

// @route   GET api/weather?district=Mandya
router.get("/", async (req, res) => {
  try {
    const district = req.query.district;
    if (!district) {
      return res.status(400).json({ msg: "District parameter is required" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ msg: "OpenWeather API key not configured" });
    }

    // 1. Geocoding
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${district},Karnataka,India&limit=1&appid=${apiKey}`;
    const geoResponse = await axios.get(geoUrl);
    
    if (!geoResponse.data || geoResponse.data.length === 0) {
      return res.status(404).json({ msg: "Location not found" });
    }

    const { lat, lon } = geoResponse.data[0];

    // 2. Current Weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const weatherRes = await axios.get(weatherUrl);
    
    // 3. Forecast (5-day / 3-hour, we'll pick daily max/min)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastRes = await axios.get(forecastUrl);

    // Process forecast to get daily min/max
    const dailyForecasts = {};
    forecastRes.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          min: item.main.temp_min,
          max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      } else {
        dailyForecasts[date].min = Math.min(dailyForecasts[date].min, item.main.temp_min);
        dailyForecasts[date].max = Math.max(dailyForecasts[date].max, item.main.temp_max);
      }
    });

    const forecastArray = Object.values(dailyForecasts).slice(0, 5);

    const response = {
      location: district,
      current: {
        temp: weatherRes.data.main.temp,
        feelsLike: weatherRes.data.main.feels_like,
        humidity: weatherRes.data.main.humidity,
        windSpeed: weatherRes.data.wind.speed,
        description: weatherRes.data.weather[0].description,
        icon: weatherRes.data.weather[0].icon
      },
      forecast: forecastArray
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error fetching weather data");
  }
});

module.exports = router;
