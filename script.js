const apiKey = "f9971e0905798c286b0b72b3e848e2a6Y"; // Replace with your OpenWeatherMap API key

// DOM Elements
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const cityNameElement = document.getElementById("city-name");
const dateElement = document.getElementById("date");
const temperatureElement = document.getElementById("temperature");
const weatherDescriptionElement = document.getElementById("weather-description");
const weatherIconElement = document.getElementById("weather-icon");
const feelsLikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const forecastElement = document.getElementById("forecast");

// Add event listener to the search button
searchButton.addEventListener("click", getWeather);

// Also search when user presses Enter in the input field
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Function to get weather data
function getWeather() {
    const cityName = cityInput.value.trim();
    
    if (cityName === "") {
        alert("Please enter a city name!");
        return;
    }
    
    // API URLs
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;
    
    // Fetch current weather data
    fetch(currentWeatherURL)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found. Please try again!");
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            
            // Fetch forecast data after current weather is successful
            return fetch(forecastURL);
        })
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Function to display current weather
function displayCurrentWeather(data) {
    // Update weather information
    cityNameElement.textContent = `${data.name}, ${data.sys.country}`;
    
    // Format and display date
    const date = new Date();
    dateElement.textContent = formatDate(date);
    
    // Display temperature
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    
    // Display weather description and icon
    weatherDescriptionElement.textContent = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Display weather details
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
}

// Function to display 5-day forecast
function displayForecast(data) {
    // Clear previous forecast
    forecastElement.innerHTML = "";
    
    // We need one forecast per day (excluding current day)
    // OpenWeatherMap gives forecast in 3-hour intervals
    const dailyForecasts = {};
    
    // Process each forecast item
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();
        
        // If we don't have this day yet, add it
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });
    
    // Convert object to array and keep only 5 days
    const forecastArray = Object.values(dailyForecasts).slice(0, 5);
    
    // Create HTML for each forecast day
    forecastArray.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = getDayName(date);
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        
        const forecastDay = document.createElement("div");
        forecastDay.className = "forecast-day";
        forecastDay.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${item.weather[0].description}">
            <p>${temp}°C</p>
            <p>${item.weather[0].description}</p>
        `;
        
        forecastElement.appendChild(forecastDay);
    });
}

// Helper function to format date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get day name
function getDayName(date) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
}

// Load default city on page load (optional)
window.onload = function() {
    cityInput.value = "London"; // Default city
    getWeather();
};