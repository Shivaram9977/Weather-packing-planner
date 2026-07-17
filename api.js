/**
 * API client module for fetching weather data from OpenWeatherMap or using high-fidelity mock data
 */

// Helper to hash string to a seed number between 0 and 1
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) / 2147483647;
}

// Generates high-fidelity mock weather data based on the city name seed
export function getMockWeatherData(cityName) {
  const seed = hashString(cityName.trim().toLowerCase());
  
  // Array of potential weather configurations
  const conditions = [
    { group: 'Clear', desc: 'clear sky', tempMin: 22, tempMax: 35, humidity: 35, wind: 2.1, icon: '01d' },
    { group: 'Clouds', desc: 'scattered clouds', tempMin: 12, tempMax: 20, humidity: 65, wind: 4.5, icon: '03d' },
    { group: 'Rain', desc: 'moderate rain', tempMin: 8, tempMax: 14, humidity: 88, wind: 6.2, icon: '10d' },
    { group: 'Snow', desc: 'light snow', tempMin: -5, tempMax: 2, humidity: 78, wind: 5.0, icon: '13d' },
    { group: 'Thunderstorm', desc: 'storm with heavy rain', tempMin: 15, tempMax: 22, humidity: 92, wind: 9.8, icon: '11d' }
  ];

  // Specific overrides for default cities to showcase variety
  let selected = conditions[Math.floor(seed * conditions.length)];
  const lowerCity = cityName.trim().toLowerCase();
  
  if (lowerCity === 'london') {
    selected = conditions[2]; // Rain
  } else if (lowerCity === 'new york') {
    selected = conditions[1]; // Clouds
  } else if (lowerCity === 'tokyo') {
    selected = conditions[1]; // Clouds (windy)
    selected.wind = 11.5; // Trigger wind rule
  } else if (lowerCity === 'cairo') {
    selected = conditions[0]; // Clear + Hot
    selected.tempMin = 31;
    selected.tempMax = 39;
  } else if (lowerCity === 'sydney') {
    selected = conditions[0]; // Clear + Sunny (pleasant)
    selected.tempMin = 18;
    selected.tempMax = 26;
  } else if (lowerCity === 'moscow' || lowerCity === 'reykjavik') {
    selected = conditions[3]; // Snow
  }

  const currentTemp = Math.round(selected.tempMin + (selected.tempMax - selected.tempMin) * 0.6);
  
  // Format current hourly list (next 8 hours)
  const hourly = [];
  const baseHour = new Date().getHours();
  for (let i = 0; i < 8; i++) {
    const hr = (baseHour + i * 2) % 24;
    const timeStr = `${hr.toString().padStart(2, '0')}:00`;
    const tempOffset = Math.sin(i / 2) * 2;
    hourly.push({
      time: timeStr,
      tempC: Math.round(currentTemp + tempOffset),
      conditionGroup: selected.group,
      iconCode: selected.icon
    });
  }

  // Format 3-day forecast
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const forecast = [];
  const today = new Date();

  for (let i = 1; i <= 3; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const dayName = daysOfWeek[nextDate.getDay()];
    
    // Choose weather conditions for the forecast days
    const daySeed = hashString(cityName + i);
    const dayCond = conditions[Math.floor(daySeed * conditions.length)];
    
    forecast.push({
      dayName: i === 1 ? 'Tomorrow' : dayName,
      tempMinC: Math.round(dayCond.tempMin - 1),
      tempMaxC: Math.round(dayCond.tempMax + 1),
      conditionGroup: dayCond.group,
      description: dayCond.desc,
      iconCode: dayCond.icon
    });
  }

  return {
    city: cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase(),
    country: seed > 0.5 ? 'US' : 'GB',
    tempC: currentTemp,
    humidity: selected.humidity,
    windSpeed: selected.wind,
    conditionGroup: selected.group,
    description: selected.desc,
    iconCode: selected.icon,
    hourly,
    forecast
  };
}

/**
 * Normalizes OpenWeatherMap 5-day / 3-hour forecast response into 3-day and hourly format
 */
function normalizeForecastData(forecastList) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  // Group 3-hour blocks by date
  const groups = {};
  forecastList.forEach(item => {
    const dateStr = item.dt_txt.split(' ')[0];
    if (dateStr === todayDateStr) return; // Skip today's remaining hours for 3-day forecast
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);
  });

  // Extract the next 3 days
  const sortedDates = Object.keys(groups).sort();
  const next3Days = sortedDates.slice(0, 3);
  
  const today = new Date();
  
  return next3Days.map((dateStr, index) => {
    const dayItems = groups[dateStr];
    let tempMin = Infinity;
    let tempMax = -Infinity;
    const weatherCounts = {};
    let representativeItem = dayItems[0];
    
    dayItems.forEach(item => {
      if (item.main.temp_min < tempMin) tempMin = item.main.temp_min;
      if (item.main.temp_max > tempMax) tempMax = item.main.temp_max;
      
      const cond = item.weather[0].main;
      weatherCounts[cond] = (weatherCounts[cond] || 0) + 1;
    });

    // Find most frequent condition
    let maxCount = 0;
    let mainCond = dayItems[0].weather[0].main;
    Object.entries(weatherCounts).forEach(([cond, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mainCond = cond;
      }
    });

    // Find an item matching mainCond to copy icon and description
    const matchingItem = dayItems.find(item => item.weather[0].main === mainCond) || dayItems[0];
    
    const targetDate = new Date(dateStr);
    let dayLabel = daysOfWeek[targetDate.getDay()];
    if (index === 0) dayLabel = 'Tomorrow';

    return {
      dayName: dayLabel,
      tempMinC: Math.round(tempMin),
      tempMaxC: Math.round(tempMax),
      conditionGroup: matchingItem.weather[0].main,
      description: matchingItem.weather[0].description,
      iconCode: matchingItem.weather[0].icon
    };
  });
}

/**
 * Normalizes OpenWeatherMap 5-day / 3-hour forecast for the hourly strip (first 8 intervals)
 */
function normalizeHourlyData(forecastList) {
  return forecastList.slice(0, 8).map(item => {
    const time = item.dt_txt.split(' ')[1].substring(0, 5); // "HH:MM"
    return {
      time,
      tempC: Math.round(item.main.temp),
      conditionGroup: item.weather[0].main,
      iconCode: item.weather[0].icon
    };
  });
}

/**
 * Main function to fetch weather data for a city, either from the OpenWeatherMap API or Mock Mode
 * @param {string} city - The city to search for
 * @param {string} apiKey - The user's API Key (null if Demo Mode)
 * @returns {Promise<Object>} Weather payload
 */
/**
 * Map WMO weather code to condition group, description, and icon code
 */
function mapWmoCode(code, isDay = 1) {
  switch (code) {
    case 0:
      return { conditionGroup: 'Clear', description: 'Clear sky', iconCode: isDay ? '01d' : '01n' };
    case 1:
    case 2:
    case 3:
      return { conditionGroup: 'Clouds', description: ['Mainly clear', 'Partly cloudy', 'Overcast'][code - 1] || 'Overcast', iconCode: isDay ? '03d' : '03n' };
    case 45:
    case 48:
      return { conditionGroup: 'Clouds', description: 'Foggy', iconCode: '50d' };
    case 51:
    case 53:
    case 55:
      return { conditionGroup: 'Drizzle', description: 'Drizzle', iconCode: '09d' };
    case 56:
    case 57:
      return { conditionGroup: 'Drizzle', description: 'Freezing drizzle', iconCode: '09d' };
    case 61:
    case 63:
    case 65:
      return { conditionGroup: 'Rain', description: 'Rain', iconCode: '10d' };
    case 66:
    case 67:
      return { conditionGroup: 'Rain', description: 'Freezing rain', iconCode: '10d' };
    case 71:
    case 73:
    case 75:
      return { conditionGroup: 'Snow', description: 'Snowfall', iconCode: '13d' };
    case 77:
      return { conditionGroup: 'Snow', description: 'Snow grains', iconCode: '13d' };
    case 80:
    case 81:
    case 82:
      return { conditionGroup: 'Rain', description: 'Rain showers', iconCode: '10d' };
    case 85:
    case 86:
      return { conditionGroup: 'Snow', description: 'Snow showers', iconCode: '13d' };
    case 95:
      return { conditionGroup: 'Thunderstorm', description: 'Thunderstorm', iconCode: '11d' };
    case 96:
    case 99:
      return { conditionGroup: 'Thunderstorm', description: 'Thunderstorm with hail', iconCode: '11d' };
    default:
      return { conditionGroup: 'Clear', description: 'Clear', iconCode: '01d' };
  }
}

/**
 * Fetch city coordinates using Open-Meteo Geocoding API
 */
async function fetchCityCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error('Geocoding service unavailable');
  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check spelling.`);
  }
  return geoData.results[0];
}

/**
 * Fetch weather from Open-Meteo API using coordinates
 */
async function fetchFromOpenMeteo(lat, lon, cityName, countryCode) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;
  const res = await fetch(forecastUrl);
  if (!res.ok) throw new Error('Weather service unavailable');
  const data = await res.json();

  const currentWmo = mapWmoCode(data.current.weather_code, data.current.is_day);

  // Normalize hourly (next 8 intervals, step of 2 hours)
  const hourly = [];
  const startIndex = data.hourly.time.indexOf(data.current.time) !== -1 
    ? data.hourly.time.indexOf(data.current.time) 
    : new Date().getHours();
  
  for (let i = 0; i < 8; i++) {
    const idx = startIndex + i * 2;
    if (idx >= data.hourly.time.length) break;
    const timeStr = data.hourly.time[idx].split('T')[1].substring(0, 5);
    const mappedHour = mapWmoCode(data.hourly.weather_code[idx], 1);
    hourly.push({
      time: timeStr,
      tempC: Math.round(data.hourly.temperature_2m[idx]),
      conditionGroup: mappedHour.conditionGroup,
      iconCode: mappedHour.iconCode
    });
  }

  // Normalize forecast (3-day forecast)
  const forecast = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 1; i <= 3; i++) {
    if (i >= data.daily.time.length) break;
    const dateStr = data.daily.time[i];
    const dateObj = new Date(dateStr);
    const dayLabel = i === 1 ? 'Tomorrow' : daysOfWeek[dateObj.getDay()];
    const mappedDay = mapWmoCode(data.daily.weather_code[i], 1);
    forecast.push({
      dayName: dayLabel,
      tempMinC: Math.round(data.daily.temperature_2m_min[i]),
      tempMaxC: Math.round(data.daily.temperature_2m_max[i]),
      conditionGroup: mappedDay.conditionGroup,
      description: mappedDay.description,
      iconCode: mappedDay.iconCode
    });
  }

  return {
    city: cityName,
    country: countryCode || 'US',
    tempC: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: data.current.wind_speed_10m,
    conditionGroup: currentWmo.conditionGroup,
    description: currentWmo.description,
    iconCode: currentWmo.iconCode,
    hourly,
    forecast
  };
}

/**
 * Main function to fetch weather data for a city, either from the OpenWeatherMap API or Mock Mode
 * @param {string} city - The city to search for
 * @param {string} apiKey - The user's API Key (null if Demo Mode)
 * @returns {Promise<Object>} Weather payload
 */
export async function fetchWeather(city, apiKey = null) {
  if (!city || city.trim() === '') {
    throw new Error('City name cannot be empty');
  }

  // If no API key is provided, try Open-Meteo first, fall back to Mock Demo Mode
  if (!apiKey || apiKey.trim() === '') {
    try {
      const location = await fetchCityCoordinates(city);
      return await fetchFromOpenMeteo(location.latitude, location.longitude, location.name, location.country_code);
    } catch (error) {
      console.warn("Open-Meteo fetch failed, using fallback mock data:", error);
      if (error.message.includes('not found')) {
        throw error;
      }
      // If mock fallback is needed:
      return getMockWeatherData(city);
    }
  }

  const encodedCity = encodeURIComponent(city.trim());
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${apiKey}&units=metric`;

  try {
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) {
      if (currentRes.status === 404) {
        throw new Error(`City "${city}" not found. Please check spelling.`);
      } else if (currentRes.status === 401) {
        throw new Error('Invalid API Key. Please verify your OpenWeatherMap API Key in settings.');
      } else {
        throw new Error(`Failed to load weather. Server responded with status ${currentRes.status}`);
      }
    }
    const currentData = await currentRes.json();

    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
      throw new Error(`Failed to load forecast data. Status: ${forecastRes.status}`);
    }
    const forecastData = await forecastRes.json();

    const normalizedForecast = normalizeForecastData(forecastData.list);
    const normalizedHourly = normalizeHourlyData(forecastData.list);

    return {
      city: currentData.name,
      country: currentData.sys.country,
      tempC: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed, // m/s
      conditionGroup: currentData.weather[0].main,
      description: currentData.weather[0].description,
      iconCode: currentData.weather[0].icon,
      hourly: normalizedHourly,
      forecast: normalizedForecast
    };
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
}

/**
 * Fetches weather based on geographical coordinates (latitude and longitude)
 * Used for the geolocation "Use My Location" feature
 */
export async function fetchWeatherByCoords(lat, lon, apiKey = null) {
  // If no API key is present, use Open-Meteo with Nominatim reverse geocoding fallback
  if (!apiKey || apiKey.trim() === '') {
    let cityName = 'Current Location';
    let countryCode = '';
    try {
      const revGeoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (revGeoRes.ok) {
        const revGeoData = await revGeoRes.json();
        if (revGeoData && revGeoData.address) {
          cityName = revGeoData.address.city || revGeoData.address.town || revGeoData.address.village || revGeoData.address.suburb || 'Current Location';
          countryCode = revGeoData.address.country_code ? revGeoData.address.country_code.toUpperCase() : '';
        }
      }
    } catch (e) {
      console.warn("Reverse geocoding failed, using fallback name", e);
    }
    
    try {
      return await fetchFromOpenMeteo(lat, lon, cityName, countryCode);
    } catch (error) {
      console.warn("Open-Meteo fetch by coords failed, using fallback mock data:", error);
      return getMockWeatherData('Current Location');
    }
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) {
      throw new Error('Failed to load weather for your coordinates.');
    }
    const currentData = await currentRes.json();

    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
      throw new Error('Failed to load forecast data.');
    }
    const forecastData = await forecastRes.json();

    return {
      city: currentData.name,
      country: currentData.sys.country,
      tempC: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      conditionGroup: currentData.weather[0].main,
      description: currentData.weather[0].description,
      iconCode: currentData.weather[0].icon,
      hourly: normalizeHourlyData(forecastData.list),
      forecast: normalizeForecastData(forecastData.list)
    };
  } catch (error) {
    throw error;
  }
}

