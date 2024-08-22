import React, { useState, useEffect } from 'react';
import cloud from "../images/Clouds.png";
import rain from "../images/Rain.png";
import clear from "../images/Clear.png";
import mist from "../images/mist.png";
import err from "../images/error.png";

const Myapp = () => {
    const [search, setSearch] = useState("Noida");
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [error, setError] = useState("");
    const [unit, setUnit] = useState("metric"); // Default to Celsius
    const [tempUnit, setTempUnit] = useState("F"); // Temperature unit symbol

    const API_KEY = "315832a9d015135745b70ec0767722ee";

    useEffect(() => {
        // Fetch weather data for the default city on component mount
        fetchWeatherData();
    }, []);

    useEffect(() => {
        // Refetch weather data whenever unit changes
        if (search.trim() !== "") {
            fetchWeatherData();
        }
    }, [unit]);

    const handleInput = (event) => {
        setSearch(event.target.value);
    };

    const fetchWeatherData = async () => {
        if (search.trim() === "") {
            setError("Please Enter a City Name");
            setCurrentWeather(null);
            setForecast([]);
            return;
        }

        try {
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_KEY}&units=${unit}`
            );
            const currentData = await currentResponse.json();

            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${API_KEY}&units=${unit}`
            );
            const forecastData = await forecastResponse.json();

            if (currentData.cod === '404' || forecastData.cod === '404') {
                setError("Please Enter a Valid City Name!");
                setCurrentWeather(null);
                setForecast([]);
            } else {
                setCurrentWeather(currentData);
                processForecast(forecastData.list);
                setError("");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    const processForecast = (forecastList) => {
        const dailyData = [];

        forecastList.forEach((item) => {
            const date = new Date(item.dt_txt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });

            const existingDay = dailyData.find((day) => day.date === date);

            if (existingDay) {
                existingDay.tempSum += item.main.temp;
                existingDay.count += 1;
                existingDay.weather.push(item.weather[0]);
            } else {
                dailyData.push({
                    date,
                    tempSum: item.main.temp,
                    count: 1,
                    weather: [item.weather[0]],
                });
            }
        });

        const averagedData = dailyData.map((day) => ({
            date: day.date,
            avgTemp: (day.tempSum / day.count).toFixed(1),
            mainWeather: day.weather[0].main,
            description: day.weather[0].description,
        }));

        setForecast(averagedData.slice(0, 5));
    };

    const toggleUnit = () => {
        if (unit === "metric") {
            setUnit("imperial");
            setTempUnit("C");
        } else {
            setUnit("metric");
            setTempUnit("F");
        }
    };

    const convertTemperature = (temp) => {
        if (unit === "metric") {
            // Celsius to Fahrenheit
            return (temp * 9 / 5 + 32).toFixed(2);
        } else {
            // Fahrenheit to Celsius
            return ((temp - 32) * 5 / 9).toFixed(2);
        }
    };
    
    const getWeatherIcon = (main) => {
        switch (main) {
            case "Clouds":
                return cloud;
            case "Rain":
                return rain;
            case "Clear":
                return clear;
            case "Mist":
                return mist;
            case "Haze":
                return cloud;
            default:
                return "";
        }
    };

    return (
        <div className='container'>
            <div className='inputs'>
                <input
                    placeholder='Enter city, Country'
                    value={search}
                    onChange={handleInput}
                />
                <button onClick={fetchWeatherData}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <button onClick={toggleUnit} className="unit-toggle">
                    {unit === "metric" ? "Switch to °C" : "Switch to °F"}
                </button>
            </div>

            <div className='weather-container'>
                {error && (
                    <div className='errorPage'>
                        <p>{error}</p>
                        <img src={err} alt="Error" />
                    </div>
                )}

                {currentWeather && currentWeather.weather && (
                    <div className='current-weather'>
                        <h2 className='cityName'>{currentWeather.name}</h2>
                        <img src={getWeatherIcon(currentWeather.weather[0].main)} alt={currentWeather.weather[0].main} />
                        <h2 className='temprature'>{convertTemperature(currentWeather.main.temp)}°{tempUnit}</h2>
                        <p className='climate'>{currentWeather.weather[0].description}</p>
                        <p>Min: {convertTemperature(currentWeather.main.temp_min)}°{tempUnit} | Max: {convertTemperature(currentWeather.main.temp_max)}°{tempUnit}</p>
                        <p>Humidity: {currentWeather.main.humidity}%</p>
                        <p>Wind: {currentWeather.wind.speed} {unit === "metric" ? "m/s" : "mph"} at {currentWeather.wind.deg}°</p>
                    </div>
                )}

                {forecast.length > 0 && (
                    <div className='forecast'>
                        <h3>5-Day Forecast</h3>
                        {forecast.map((day, index) => (
                            <div key={index} className='forecast-day'>
                                <p>{day.date}</p>
                                <img src={getWeatherIcon(day.mainWeather)} alt={day.mainWeather} />
                                <p>{convertTemperature(day.avgTemp)}°{tempUnit}</p>
                                <p>{day.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Myapp;
