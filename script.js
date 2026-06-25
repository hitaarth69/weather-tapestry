// ----- DOM References -----
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchStatus = document.getElementById('search-status');
const cityNameEl = document.getElementById('city-name');
const currentTempEl = document.getElementById('current-temp');
const currentConditionEl = document.getElementById('current-condition');
const currentHumidityEl = document.getElementById('current-humidity');
const currentWindEl = document.getElementById('current-wind');
const currentIconEl = document.getElementById('current-icon');
const forecastGrid = document.getElementById('forecast-grid');

// ----- State -----
let lastSearchedCity = '';

// ----- Load last city from LocalStorage -----
function loadLastCity() {
    const saved = localStorage.getItem('weatherLastCity');
    if (saved) {
        lastSearchedCity = saved;
        cityInput.value = saved;
        fetchWeather(saved);
    }
}

// ----- Save city to LocalStorage -----
function saveLastCity(city) {
    lastSearchedCity = city;
    localStorage.setItem('weatherLastCity', city);
}

// ----- Map Open-Meteo weather codes to icons -----
function getWeatherIcon(code, isDay = true) {
    // WMO Weather code reference: https://open-meteo.com/en/docs
    const iconMap = {
        0: '☀️',   // Clear sky
        1: '🌤️',   // Mainly clear
        2: '⛅',    // Partly cloudy
        3: '☁️',    // Overcast
        45: '🌫️',  // Fog
        48: '🌫️',  // Depositing rime fog
        51: '🌦️',  // Drizzle: Light
        53: '🌦️',  // Drizzle: Moderate
        55: '🌧️',  // Drizzle: Dense
        56: '🌧️',  // Freezing Drizzle: Light
        57: '🌧️',  // Freezing Drizzle: Dense
        61: '🌧️',  // Rain: Slight
        63: '🌧️',  // Rain: Moderate
        65: '🌧️',  // Rain: Heavy
        66: '🌧️',  // Freezing Rain: Light
        67: '🌧️',  // Freezing Rain: Heavy
        71: '❄️',  // Snow fall: Slight
        73: '❄️',  // Snow fall: Moderate
        75: '❄️',  // Snow fall: Heavy
        77: '🌨️',  // Snow grains
        80: '🌦️',  // Rain showers: Slight
        81: '🌦️',  // Rain showers: Moderate
        82: '⛈️',  // Rain showers: Violent
        85: '❄️',  // Snow showers: Slight
        86: '❄️',  // Snow showers: Heavy
        95: '⛈️',  // Thunderstorm: Slight
        96: '⛈️',  // Thunderstorm: Moderate
        99: '⛈️',  // Thunderstorm: Heavy
    };
    return iconMap[code] || '🌤️';
}

// ----- Get day name from date string -----
function getDayName(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ----- Format date nicely -----
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ----- Fetch weather data -----
async function fetchWeather(city) {
    // Show loading state
    searchStatus.textContent = '⏳ Fetching weather data...';
    searchStatus.className = 'search-status';
    cityNameEl.textContent = 'Loading...';
    currentTempEl.textContent = '—';
    currentConditionEl.textContent = '—';
    currentHumidityEl.textContent = '💧 —';
    currentWindEl.textContent = '🌬️ —';
    currentIconEl.textContent = '⏳';
    forecastGrid.innerHTML = '';

    try {
        // 1. Geocode: convert city name to coordinates using Open-Meteo Geocoding API
        const geocodeUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geocodeUrl);
        if (!geoRes.ok) throw new Error('Geocoding service unavailable');
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Please check the spelling.`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        const displayName = `${name}${country ? `, ${country}` : ''}`;

        // 2. Fetch weather forecast
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error('Weather service unavailable');
        const weatherData = await weatherRes.json();

        // 3. Update UI
        saveLastCity(city);
        renderCurrentWeather(displayName, weatherData.current, weatherData.current.time);
        renderForecast(weatherData.daily);

        searchStatus.textContent = `✅ Showing weather for ${displayName}`;
        searchStatus.className = 'search-status success';

    } catch (error) {
        searchStatus.textContent = `❌ ${error.message}`;
        searchStatus.className = 'search-status error';
        cityNameEl.textContent = '—';
        currentTempEl.textContent = '—';
        currentConditionEl.textContent = '—';
        currentHumidityEl.textContent = '💧 —';
        currentWindEl.textContent = '🌬️ —';
        currentIconEl.textContent = '❌';
        forecastGrid.innerHTML = '';
    }
}

// ----- Render Current Weather -----
function renderCurrentWeather(displayName, current, time) {
    cityNameEl.textContent = displayName;

    const temp = current.temperature_2m;
    currentTempEl.textContent = `${Math.round(temp)}°C`;

    const weatherCode = current.weather_code;
    const icon = getWeatherIcon(weatherCode, true);
    currentIconEl.textContent = icon;

    // Condition description (simplified mapping)
    const conditionMap = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        56: 'Light Freezing Drizzle',
        57: 'Dense Freezing Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        66: 'Light Freezing Rain',
        67: 'Heavy Freezing Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Slight Thunderstorm',
        96: 'Moderate Thunderstorm',
        99: 'Heavy Thunderstorm',
    };
    currentConditionEl.textContent = conditionMap[weatherCode] || '—';

    currentHumidityEl.textContent = `💧 ${current.relative_humidity_2m}%`;
    currentWindEl.textContent = `🌬️ ${Math.round(current.wind_speed_10m)} km/h`;
}

// ----- Render 5‑Day Forecast -----
function renderForecast(daily) {
    const times = daily.time;
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;
    const weatherCodes = daily.weather_code;

    forecastGrid.innerHTML = '';

    for (let i = 0; i < times.length; i++) {
        const dayName = getDayName(times[i]);
        const dateStr = formatDate(times[i]);
        const icon = getWeatherIcon(weatherCodes[i], true);
        const max = Math.round(maxTemps[i]);
        const min = Math.round(minTemps[i]);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${max}° <span class="low">${min}°</span></div>
            <div class="forecast-condition">${dateStr}</div>
        `;
        forecastGrid.appendChild(card);
    }
}

// ----- Event Listeners -----
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        searchStatus.textContent = '⚠️ Please enter a city name.';
        searchStatus.className = 'search-status error';
        return;
    }
    fetchWeather(city);
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// ----- Initialize -----
loadLastCity();
