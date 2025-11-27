
const API_KEY = 'b1a5a2fca77796cd031ec89ae0fcd260';


const cityInput = document.getElementById('cityInput');
const weatherBtn = document.getElementById('weatherBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');


weatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Proszę wprowadzić nazwę miasta');
    }
});


cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        weatherBtn.click();
    }
});


function getWeatherData(city) {
    
    hideAll();
    loading.style.display = 'block';

    
    getCurrentWeather(city);
    
    
    getForecast(city);
}


function getCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;
    
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            
            
            console.log('=== ODPOWIEDŹ Z CURRENT WEATHER API (XMLHttpRequest) ===');
            console.log(data);
            console.log('========================================================');
            
            displayCurrentWeather(data);
        } else if (xhr.status === 404) {
            showError('Nie znaleziono miasta. Sprawdź nazwę i spróbuj ponownie.');
            loading.style.display = 'none';
        } else {
            showError('Wystąpił błąd podczas pobierania danych pogodowych.');
            loading.style.display = 'none';
        }
    };
    
    xhr.onerror = function() {
        showError('Błąd połączenia. Sprawdź połączenie internetowe.');
        loading.style.display = 'none';
    };
    
    xhr.send();
}


function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania prognozy');
            }
            return response.json();
        })
        .then(data => {
            
            console.log('=== ODPOWIEDŹ Z 5 DAY FORECAST API (Fetch) ===');
            console.log(data);
            console.log('===============================================');
            
            displayForecast(data);
            loading.style.display = 'none';
        })
        .catch(err => {
            console.error('Błąd:', err);
            showError('Wystąpił błąd podczas pobierania prognozy pogody.');
            loading.style.display = 'none';
        });
}


function displayCurrentWeather(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    document.getElementById('currentIcon').innerHTML = `<img src="${iconUrl}" alt="weather icon" style="width: 100px;">`;
    document.getElementById('cityName').innerHTML = `<h3>${data.name}, ${data.sys.country}</h3>`;
    document.getElementById('currentTemp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('currentDesc').textContent = data.weather[0].description;
    
    
    const detailsHTML = `
        <div class="detail-item">
            <div class="detail-label">Odczuwalna</div>
            <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Wilgotność</div>
            <div class="detail-value">${data.main.humidity}%</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Ciśnienie</div>
            <div class="detail-value">${data.main.pressure} hPa</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Wiatr</div>
            <div class="detail-value">${data.wind.speed} m/s</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Widoczność</div>
            <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Zachmurzenie</div>
            <div class="detail-value">${data.clouds.all}%</div>
        </div>
    `;
    
    document.getElementById('weatherDetails').innerHTML = detailsHTML;
    currentWeather.style.display = 'block';
}


function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';
    
    
    const dailyForecasts = data.list.filter(item => {
        return item.dt_txt.includes('12:00:00');
    });
    
    
    const forecastsToShow = dailyForecasts.length > 0 ? dailyForecasts.slice(0, 5) : data.list.slice(0, 5);
    
    forecastsToShow.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon"><img src="${iconUrl}" alt="weather icon" style="width: 60px;"></div>
            <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
            <div class="forecast-desc">${item.weather[0].description}</div>
        `;
        
        forecastGrid.appendChild(forecastItem);
    });
    
    forecast.style.display = 'block';
}


function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

function hideAll() {
    error.style.display = 'none';
    currentWeather.style.display = 'none';
    forecast.style.display = 'none';
    loading.style.display = 'none';
}