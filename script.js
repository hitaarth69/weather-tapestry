// ----- DOM References -----
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchStatus = document.getElementById('search-status');
const cityNameEl = document.getElementById('city-name');
const currentTempEl = document.getElementById('current-temp');
const currentFeelsLikeEl = document.getElementById('current-feelslike');
const currentConditionEl = document.getElementById('current-condition');
const currentHumidityEl = document.getElementById('current-humidity');
const currentWindEl = document.getElementById('current-wind');
const currentUvEl = document.getElementById('current-uv');
const currentIconEl = document.getElementById('current-icon');
const sunScheduleEl = document.getElementById('sun-schedule');
const sunriseDisplay = document.getElementById('sunrise-display');
const sunsetDisplay = document.getElementById('sunset-display');
const forecastGrid = document.getElementById('forecast-grid');
const hourlyScroll = document.getElementById('hourly-scroll');
const historyChips = document.getElementById('history-chips');
const unitToggle = document.getElementById('unit-toggle');
const locationBtn = document.getElementById('location-btn');
const appEl = document.getElementById('app');
const canvas = document.getElementById('weather-canvas');
const ctx = canvas.getContext('2d');

// ----- State -----
let currentWeatherData = null;
let currentHourlyData = null;
let currentDailyData = null;
let currentCityDisplay = '';
let isCelsius = true;
let particles = [];
let animationId = null;
let currentWeatherCode = 0;
let isDay = true;

// ----- Load Preferences -----
function loadPrefs() {
    const unit = localStorage.getItem('weatherUnit');
    if (unit === 'f') isCelsius = false;
    updateUnitButton();
    const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    renderHistoryChips(history);
    const lastCity = localStorage.getItem('weatherLastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        fetchWeather(lastCity);
    }
}

function savePrefs() {
    localStorage.setItem('weatherUnit', isCelsius ? 'c' : 'f');
}

// ----- Unit Toggle -----
function updateUnitButton() {
    unitToggle.textContent = isCelsius ? '🌡️ °C' : '🌡️ °F';
}

function toggleUnit() {
    isCelsius = !isCelsius;
    savePrefs();
    updateUnitButton();
    if (currentWeatherData) {
        renderCurrentWeather(currentCityDisplay, currentWeatherData, currentWeatherData.time);
        renderHourlyForecast(currentHourlyData);
        renderForecast(currentDailyData);
    }
}

unitToggle.addEventListener('click', toggleUnit);

// ----- Temperature Conversion -----
function convertTemp(c) {
    if (isCelsius) return c;
    return (c * 9 / 5) + 32;
}
function formatTemp(c) {
    const val = convertTemp(c);
    return `${Math.round(val)}°${isCelsius ? 'C' : 'F'}`;
}

// ----- Weather Icon Map -----
function getWeatherIcon(code, isDay = true) {
    const map = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌧️',
        56: '🌧️', 57: '🌧️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        66: '🌧️', 67: '🌧️',
        71: '❄️', 73: '❄️', 75: '❄️', 77: '🌨️',
        80: '🌦️', 81: '🌦️', 82: '⛈️',
        85: '❄️', 86: '❄️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return map[code] || '🌤️';
}

function getConditionText(code) {
    const map = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Fog',
        51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
        56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
        61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
        66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
        71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
        80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
        85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
        95: 'Slight Thunderstorm', 96: 'Moderate Thunderstorm', 99: 'Heavy Thunderstorm'
    };
    return map[code] || '—';
}

// ----- Dynamic Background -----
function applyBackground(code, isDay) {
    const body = document.body;
    // Remove all bg classes
    body.className = '';
    if (!isDay) {
        body.classList.add('bg-night');
        return;
    }
    if (code === 0 || code === 1) body.classList.add('bg-sunny');
    else if (code === 2 || code === 3) body.classList.add('bg-cloudy');
    else if (code >= 45 && code <= 48) body.classList.add('bg-foggy');
    else if (code >= 51 && code <= 67) body.classList.add('bg-rainy');
    else if (code >= 71 && code <= 77) body.classList.add('bg-snowy');
    else if (code >= 80 && code <= 82) body.classList.add('bg-rainy');
    else if (code >= 85 && code <= 86) body.classList.add('bg-snowy');
    else if (code >= 95 && code <= 99) body.classList.add('bg-thunder');
    else body.classList.add('bg-cloudy');
}

// ----- Canvas Particles -----
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initParticles(weatherCode, isDay) {
    // Clear existing particles
    particles = [];
    // Determine type based on weather
    let type = 'none';
    if (weatherCode >= 51 && weatherCode <= 67) type = 'rain';
    else if (weatherCode >= 71 && weatherCode <= 77) type = 'snow';
    else if (weatherCode >= 80 && weatherCode <= 82) type = 'rain';
    else if (weatherCode >= 85 && weatherCode <= 86) type = 'snow';
    else if (weatherCode >= 95 && weatherCode <= 99) type = 'rain';

    if (type === 'none') {
        if (animationId) cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const count = type === 'rain' ? 200 : 100;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: type === 'rain' ? 2 + Math.random() * 3 : 4 + Math.random() * 6,
            speedY: type === 'rain' ? 4 + Math.random() * 6 : 1 + Math.random() * 2,
            speedX: type === 'rain' ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
            opacity: 0.4 + Math.random() * 0.4,
            type: type,
            wind: (Math.random() - 0.5) * 0.5,
        });
    }
    if (animationId) cancelAnimationFrame(animationId);
    animateParticles();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let anyVisible = false;
    particles.forEach(p => {
        if (p.type === 'rain') {
            ctx.strokeStyle = `rgba(180, 210, 255, ${p.opacity * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX * 0.5, p.y + p.speedY * 0.8);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
            ctx.fill();
            ctx.shadowColor = 'rgba(255,255,255,0.2)';
            ctx.shadowBlur = 10;
        }

        p.x += p.speedX + p.wind;
        p.y += p.speedY;

        // Reset if off screen
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        anyVisible = true;
    });

    animationId = requestAnimationFrame(animateParticles);
}

// ----- Weather Fetch -----
async function fetchWeather(city) {
    searchStatus.textContent = '⏳ Fetching weather...';
    searchStatus.className = 'search-status';
    cityNameEl.textContent = 'Loading...';
    currentTempEl.textContent = '—';
    currentFeelsLikeEl.textContent = '🌡️ Feels like —';
    currentConditionEl.textContent = '—';
    currentHumidityEl.textContent = '💧 —';
    currentWindEl.textContent = '🌬️ —';
    currentUvEl.textContent = '☀️ UV —';
    currentIconEl.textContent = '⏳';
    sunriseDisplay.textContent = '🌅 —';
    sunsetDisplay.textContent = '🌇 —';
    forecastGrid.innerHTML = '';
    hourlyScroll.innerHTML = '';

    try {
        // Geocode
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error('Geocoding service unavailable');
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Check spelling.`);
        }
        const { latitude, longitude, name, country } = geoData.results[0];
        currentCityDisplay = `${name}${country ? `, ${country}` : ''}`;

        // Weather
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto&forecast_days=5`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error('Weather service unavailable');
        const data = await weatherRes.json();

        // Store data
        currentWeatherData = data.current;
        currentHourlyData = data.hourly;
        currentDailyData = data.daily;
        currentWeatherCode = data.current.weather_code;

        // Determine day/night
        const now = new Date(data.current.time);
        const sunrise = new Date(data.daily.sunrise[0]);
        const sunset = new Date(data.daily.sunset[0]);
        isDay = now > sunrise && now < sunset;

        // Update UI
        saveLastCity(city);
        addToHistory(city);
        renderCurrentWeather(currentCityDisplay, data.current, data.current.time);
        renderHourlyForecast(data.hourly);
        renderForecast(data.daily);
        applyBackground(data.current.weather_code, isDay);
        initParticles(data.current.weather_code, isDay);

        searchStatus.textContent = `✅ Showing weather for ${currentCityDisplay}`;
        searchStatus.className = 'search-status success';

    } catch (error) {
        searchStatus.textContent = `❌ ${error.message}`;
        searchStatus.className = 'search-status error';
        cityNameEl.textContent = '—';
        currentTempEl.textContent = '—';
        currentFeelsLikeEl.textContent = '🌡️ Feels like —';
        currentConditionEl.textContent = '—';
        currentHumidityEl.textContent = '💧 —';
        currentWindEl.textContent = '🌬️ —';
        currentUvEl.textContent = '☀️ UV —';
        currentIconEl.textContent = '❌';
        forecastGrid.innerHTML = '';
        hourlyScroll.innerHTML = '';
        // Remove particles on error
        particles = [];
        if (animationId) cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ----- Render Current -----
function renderCurrentWeather(displayName, current, time) {
    cityNameEl.textContent = displayName;
    const temp = current.temperature_2m;
    currentTempEl.textContent = formatTemp(temp);
    const feelsLike = current.apparent_temperature;
    currentFeelsLikeEl.textContent = `🌡️ Feels like ${formatTemp(feelsLike)}`;
    currentConditionEl.textContent = getConditionText(current.weather_code);
    currentHumidityEl.textContent = `💧 ${current.relative_humidity_2m}%`;
    currentWindEl.textContent = `🌬️ ${Math.round(current.wind_speed_10m)} km/h`;
    currentUvEl.textContent = `☀️ UV ${current.uv_index || '—'}`;
    currentIconEl.textContent = getWeatherIcon(current.weather_code, isDay);

    // Sunrise/Sunset
    if (currentDailyData && currentDailyData.sunrise) {
        const rise = new Date(currentDailyData.sunrise[0]);
        const set = new Date(currentDailyData.sunset[0]);
        sunriseDisplay.textContent = `🌅 ${rise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        sunsetDisplay.textContent = `🌇 ${set.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}

// ----- Render Hourly -----
function renderHourlyForecast(hourly) {
    if (!hourly || !hourly.time) return;
    hourlyScroll.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();
    let startIdx = hourly.time.findIndex(t => new Date(t).getHours() >= currentHour);
    if (startIdx === -1) startIdx = 0;

    const maxItems = Math.min(12, hourly.time.length - startIdx);
    for (let i = 0; i < maxItems; i++) {
        const idx = startIdx + i;
        const time = new Date(hourly.time[idx]);
        const temp = hourly.temperature_2m[idx];
        const code = hourly.weather_code[idx];
        const precip = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;
        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div class="hourly-icon">${getWeatherIcon(code, true)}</div>
            <div class="hourly-temp">${formatTemp(temp)}</div>
            ${precip > 0 ? `<div class="hourly-precip">💧 ${precip}%</div>` : ''}
        `;
        hourlyScroll.appendChild(card);
    }
}

// ----- Render 5-Day -----
function renderForecast(daily) {
    if (!daily || !daily.time) return;
    forecastGrid.innerHTML = '';
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const max = daily.temperature_2m_max[i];
        const min = daily.temperature_2m_min[i];
        const code = daily.weather_code[i];
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${getWeatherIcon(code, true)}</div>
            <div class="forecast-temp">${formatTemp(max)} <span class="low">${formatTemp(min)}</span></div>
        `;
        forecastGrid.appendChild(card);
    }
}

// ----- Search History -----
function getHistory() {
    return JSON.parse(localStorage.getItem('weatherHistory') || '[]');
}

function addToHistory(city) {
    let history = getHistory();
    history = history.filter(c => c.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    renderHistoryChips(history);
}

function renderHistoryChips(history) {
    historyChips.innerHTML = '';
    history.forEach(city => {
        const chip = document.createElement('span');
        chip.className = 'history-chip';
        chip.textContent = city;
        chip.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeather(city);
        });
        historyChips.appendChild(chip);
    });
}

function saveLastCity(city) {
    localStorage.setItem('weatherLastCity', city);
}

// ----- Geolocation -----
function getLocation() {
    if (!navigator.geolocation) {
        searchStatus.textContent = '❌ Geolocation is not supported by your browser.';
        searchStatus.className = 'search-status error';
        return;
    }
    searchStatus.textContent = '⏳ Getting your location...';
    searchStatus.className = 'search-status';
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const city = data.results[0].name;
                    cityInput.value = city;
                    fetchWeather(city);
                } else {
                    throw new Error('Could not find city for these coordinates.');
                }
            } catch (err) {
                searchStatus.textContent = `❌ ${err.message}`;
                searchStatus.className = 'search-status error';
            }
        },
        (err) => {
            searchStatus.textContent = `❌ Location access denied. Please allow location or search manually.`;
            searchStatus.className = 'search-status error';
        }
    );
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
    if (e.key === 'Enter') searchBtn.click();
});

locationBtn.addEventListener('click', getLocation);

// ----- Initialize -----
loadPrefs();
