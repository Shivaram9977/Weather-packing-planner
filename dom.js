/**
 * DOM manipulation and components rendering module
 * Enhanced with Skeleton screens, filters, select actions and full completion states
 */

export function convertCtoF(tempC) {
  return Math.round((tempC * 9 / 5) + 32);
}

export function formatTemp(tempC, unit) {
  if (unit === 'F') {
    return `${convertCtoF(tempC)}°F`;
  }
  return `${tempC}°C`;
}

// Custom inline SVGs for high-quality weather illustrations
const WEATHER_SVGs = {
  Clear: `
    <svg class="weather-illustration clear-sun" viewBox="0 0 100 100" aria-label="Sunny sky">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffbbf" stop-opacity="1" />
          <stop offset="100%" stop-color="#ff9f1c" stop-opacity="0.2" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="32" fill="url(#sunGlow)" class="glow" />
      <circle cx="50" cy="50" r="20" fill="#ff9f1c" />
      <g class="sun-rays" stroke="#ff9f1c" stroke-width="4" stroke-linecap="round">
        <line x1="50" y1="15" x2="50" y2="5" />
        <line x1="50" y1="85" x2="50" y2="95" />
        <line x1="15" y1="50" x2="5" y2="50" />
        <line x1="85" y1="50" x2="95" y2="50" />
        <line x1="25" y1="25" x2="18" y2="18" />
        <line x1="75" y1="75" x2="82" y2="82" />
        <line x1="75" y1="25" x2="82" y2="18" />
        <line x1="25" y1="75" x2="18" y2="82" />
      </g>
    </svg>
  `,
  Clouds: `
    <svg class="weather-illustration cloud-drift" viewBox="0 0 100 100" aria-label="Cloudy sky">
      <path d="M25 65 A 15 15 0 0 1 35 40 A 20 20 0 0 1 70 45 A 15 15 0 0 1 80 65 Z" fill="#e0e0e0" opacity="0.9" />
      <path d="M15 75 A 12 12 0 0 1 23 55 A 16 16 0 0 1 50 60 A 12 12 0 0 1 58 75 Z" fill="#b0c4de" opacity="0.7" />
    </svg>
  `,
  Rain: `
    <svg class="weather-illustration rain-fall" viewBox="0 0 100 100" aria-label="Rainy sky">
      <path d="M25 55 A 15 15 0 0 1 35 30 A 20 20 0 0 1 70 35 A 15 15 0 0 1 80 55 Z" fill="#7f9fb5" />
      <g class="rain-drops" stroke="#4ea8de" stroke-width="3" stroke-linecap="round">
        <line x1="35" y1="65" x2="30" y2="75" />
        <line x1="50" y1="68" x2="45" y2="78" />
        <line x1="65" y1="65" x2="60" y2="75" />
        <line x1="42" y1="78" x2="37" y2="88" />
        <line x1="58" y1="78" x2="53" y2="88" />
      </g>
    </svg>
  `,
  Snow: `
    <svg class="weather-illustration snow-fall" viewBox="0 0 100 100" aria-label="Snowy weather">
      <path d="M25 55 A 15 15 0 0 1 35 30 A 20 20 0 0 1 70 35 A 15 15 0 0 1 80 55 Z" fill="#d9e5ec" />
      <g class="snow-flakes" fill="#ffffff">
        <circle cx="35" cy="70" r="3" class="flake-1" />
        <circle cx="50" cy="73" r="2.5" class="flake-2" />
        <circle cx="65" cy="68" r="3.5" class="flake-3" />
        <circle cx="42" cy="85" r="2" class="flake-4" />
        <circle cx="58" cy="83" r="3" class="flake-5" />
      </g>
    </svg>
  `,
  Thunderstorm: `
    <svg class="weather-illustration storm-flash" viewBox="0 0 100 100" aria-label="Thunderstorm conditions">
      <path d="M25 55 A 15 15 0 0 1 35 30 A 20 20 0 0 1 70 35 A 15 15 0 0 1 80 55 Z" fill="#4d535a" />
      <polygon points="50,60 40,75 48,75 42,92 60,70 52,70" fill="#ffd166" class="lightning" />
    </svg>
  `,
  Drizzle: `
    <svg class="weather-illustration rain-fall" viewBox="0 0 100 100" aria-label="Light drizzle">
      <path d="M25 55 A 15 15 0 0 1 35 30 A 20 20 0 0 1 70 35 A 15 15 0 0 1 80 55 Z" fill="#7f9fb5" opacity="0.8" />
      <g class="rain-drops" stroke="#a2d2ff" stroke-width="1.5" stroke-linecap="round" opacity="0.8">
        <line x1="38" y1="62" x2="35" y2="68" />
        <line x1="50" y1="64" x2="47" y2="70" />
        <line x1="62" y1="62" x2="59" y2="68" />
        <line x1="44" y1="72" x2="41" y2="78" />
      </g>
    </svg>
  `
};

export function getWeatherIllustration(conditionGroup, iconCode) {
  const group = conditionGroup || 'Clear';
  if (WEATHER_SVGs[group]) {
    return WEATHER_SVGs[group];
  }
  return `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${group}" class="weather-icon-img" />`;
}

/**
 * Renders Skeleton Screen placeholders inside all data-bound containers.
 * Prevents jarring layouts jumps and creates a professional loading state.
 */
export function renderSkeletons() {
  // 1. Current Weather Hero Skeleton
  const currentContainer = document.getElementById('current-weather-container');
  if (currentContainer) {
    currentContainer.innerHTML = `
      <div class="weather-hero-card">
        <div class="hero-header">
          <div class="skeleton skeleton-title" style="width: 50%; height: 32px; margin-bottom: 8px;"></div>
          <div class="skeleton skeleton-text" style="width: 30%; height: 20px;"></div>
        </div>
        <div class="hero-body" style="margin: 20px 0;">
          <div class="skeleton skeleton-text" style="width: 40%; height: 64px;"></div>
          <div class="skeleton skeleton-circle" style="width: 90px; height: 90px; border-radius: 50%;"></div>
        </div>
        <div class="weather-details-grid" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
          <div class="detail-item"><div class="skeleton skeleton-text" style="width: 60%; height: 16px; margin-bottom: 4px;"></div><div class="skeleton skeleton-text" style="width: 40%; height: 20px;"></div></div>
          <div class="detail-item"><div class="skeleton skeleton-text" style="width: 60%; height: 16px; margin-bottom: 4px;"></div><div class="skeleton skeleton-text" style="width: 40%; height: 20px;"></div></div>
        </div>
      </div>
    `;
  }

  // 2. Hourly Forecast Scroll Skeleton
  const hourlyContainer = document.getElementById('hourly-container');
  if (hourlyContainer) {
    hourlyContainer.innerHTML = Array(6).fill(0).map(() => `
      <div class="hourly-item">
        <div class="skeleton skeleton-text" style="width: 70%; height: 14px; margin-bottom: 6px;"></div>
        <div class="skeleton skeleton-circle" style="width: 28px; height: 28px; border-radius: 50%; margin-bottom: 6px;"></div>
        <div class="skeleton skeleton-text" style="width: 60%; height: 16px;"></div>
      </div>
    `).join('');
  }

  // 3. 3-Day Forecast Skeleton
  const forecastContainer = document.getElementById('forecast-container');
  if (forecastContainer) {
    forecastContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="forecast-card">
        <div class="skeleton skeleton-text" style="width: 50%; height: 18px; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-circle" style="width: 48px; height: 48px; border-radius: 50%; margin: 8px 0;"></div>
        <div class="skeleton skeleton-text" style="width: 70%; height: 14px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 60%; height: 18px;"></div>
      </div>
    `).join('');
  }

  // 4. Packing List Skeleton
  const packingContainer = document.getElementById('packing-list-container');
  if (packingContainer) {
    packingContainer.innerHTML = `
      <div class="packing-checklist">
        ${Array(3).fill(0).map(() => `
          <div class="packing-item" style="display: flex; gap: 12px; align-items: center;">
            <div class="skeleton skeleton-circle" style="width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;"></div>
            <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">
              <div class="skeleton skeleton-text" style="width: 65%; height: 16px;"></div>
              <div class="skeleton skeleton-text" style="width: 40%; height: 12px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Render Current Weather Hero Card
 */
export function renderCurrentWeather(weather, unit) {
  const container = document.getElementById('current-weather-container');
  if (!container) return;

  const illustration = getWeatherIllustration(weather.conditionGroup, weather.iconCode);

  container.innerHTML = `
    <div class="weather-hero-card">
      <div class="hero-header">
        <h2 class="city-name">${weather.city}, <span class="country-code">${weather.country}</span></h2>
        <span class="weather-desc">${weather.description}</span>
      </div>
      <div class="hero-body">
        <div class="temp-display-container">
          <span class="main-temp">${formatTemp(weather.tempC, unit)}</span>
        </div>
        <div class="weather-graphic">
          ${illustration}
        </div>
      </div>
      <div class="weather-details-grid">
        <div class="detail-item">
          <span class="detail-label">💧 Humidity</span>
          <span class="detail-value">${weather.humidity}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">💨 Wind Speed</span>
          <span class="detail-value">${weather.windSpeed} m/s</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render 3-Day Forecast Cards
 */
export function renderForecast(forecastList, unit) {
  const container = document.getElementById('forecast-container');
  if (!container) return;

  container.innerHTML = '';

  forecastList.forEach(day => {
    const illustration = getWeatherIllustration(day.conditionGroup, day.iconCode);
    const card = document.createElement('div');
    card.className = 'forecast-card animate-fade-in';
    
    card.innerHTML = `
      <h3 class="forecast-day">${day.dayName}</h3>
      <div class="forecast-icon">
        ${illustration}
      </div>
      <div class="forecast-desc">${day.description}</div>
      <div class="forecast-temps">
        <span class="temp-max">${formatTemp(day.tempMaxC, unit)}</span>
        <span class="temp-min">${formatTemp(day.tempMinC, unit)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Render Hourly scroll strip
 */
export function renderHourly(hourlyList, unit) {
  const container = document.getElementById('hourly-container');
  if (!container) return;

  container.innerHTML = '';

  hourlyList.forEach(hour => {
    const illustration = getWeatherIllustration(hour.conditionGroup, hour.iconCode);
    const item = document.createElement('div');
    item.className = 'hourly-item animate-fade-in';

    item.innerHTML = `
      <span class="hourly-time">${hour.time}</span>
      <div class="hourly-icon">${illustration}</div>
      <span class="hourly-temp">${formatTemp(hour.tempC, unit)}</span>
    `;
    container.appendChild(item);
  });
}

/**
 * Render Search History Pills
 */
export function renderSearchHistory(history, onHistoryClick) {
  const container = document.getElementById('history-container');
  if (!container) return;

  if (!history || history.length === 0) {
    container.innerHTML = '<span class="history-empty">No recent searches</span>';
    return;
  }

  container.innerHTML = '';
  history.forEach(city => {
    const pill = document.createElement('button');
    pill.className = 'history-pill';
    pill.textContent = city;
    pill.setAttribute('aria-label', `Search weather for ${city}`);
    pill.addEventListener('click', () => onHistoryClick(city));
    container.appendChild(pill);
  });
}

/**
 * Render Packing checklist and progress bar
 * Updates fully when a new city is searched to prevent stale data leaking
 */
export function renderPackingList(
  suggestions,
  checkedItems,
  activeFilter,
  onCheckToggle,
  onFilterChange,
  onBulkAction
) {
  const container = document.getElementById('packing-list-container');
  const progressContainer = document.getElementById('packing-progress-container');
  if (!container || !progressContainer) return;

  if (!suggestions || suggestions.length === 0) {
    container.innerHTML = `
      <div class="empty-packing-state animate-fade-in">
        <p>☀️ Weather looks perfect. No specific gear recommended for these conditions!</p>
      </div>
    `;
    progressContainer.innerHTML = '';
    return;
  }

  // Calculate overall progress across ALL items
  const totalCount = suggestions.length;
  const packedCount = suggestions.filter(item => checkedItems[item.id]).length;
  const percent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  // Render progress bar & Success state message
  let successStateMarkup = '';
  if (percent === 100 && totalCount > 0) {
    successStateMarkup = `
      <div class="checklist-success-banner animate-fade-in">
        <span>🎉 Fully Packed & Ready to Go!</span>
      </div>
    `;
  }

  progressContainer.innerHTML = `
    <div class="progress-bar-header">
      <span class="progress-label">🧳 Packing Progress</span>
      <span class="progress-percentage">${percent}% (${packedCount}/${totalCount})</span>
    </div>
    <div class="progress-bar-track">
      <div class="progress-bar-fill" style="width: ${percent}%"></div>
    </div>
    ${successStateMarkup}
  `;

  // Render checklist actions and filters
  container.innerHTML = '';

  const filterBar = document.createElement('div');
  filterBar.className = 'packing-filter-bar';

  // Get categories present in current suggestions list plus 'All'
  const categories = ['All', ...new Set(suggestions.map(s => s.category))];

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-tab-btn ${activeFilter === cat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => onFilterChange(cat));
    filterBar.appendChild(btn);
  });

  // Action Buttons: Select All / Reset
  const bulkActions = document.createElement('div');
  bulkActions.className = 'packing-bulk-actions';

  const selectAllBtn = document.createElement('button');
  selectAllBtn.className = 'bulk-action-btn';
  selectAllBtn.textContent = 'Check All';
  selectAllBtn.addEventListener('click', () => onBulkAction('check_all'));

  const clearAllBtn = document.createElement('button');
  clearAllBtn.className = 'bulk-action-btn';
  clearAllBtn.textContent = 'Reset';
  clearAllBtn.addEventListener('click', () => onBulkAction('reset'));

  bulkActions.appendChild(selectAllBtn);
  bulkActions.appendChild(clearAllBtn);

  container.appendChild(filterBar);
  container.appendChild(bulkActions);

  // Filter the list of recommendations
  const filteredSuggestions = activeFilter === 'All'
    ? suggestions
    : suggestions.filter(s => s.category === activeFilter);

  if (filteredSuggestions.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-packing-state';
    emptyMsg.innerHTML = `<p>No recommendations under "${activeFilter}" category.</p>`;
    container.appendChild(emptyMsg);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'packing-checklist';

  filteredSuggestions.forEach(item => {
    const isChecked = !!checkedItems[item.id];
    const li = document.createElement('li');
    li.className = `packing-item animate-fade-in ${isChecked ? 'packed' : ''}`;

    li.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
        <span class="custom-checkbox"></span>
        <span class="packing-text-wrapper">
          <span class="packing-item-text">${item.suggestion}</span>
          <span class="packing-item-subtext">${item.description}</span>
        </span>
        <span class="category-tag-badge">${item.category}</span>
      </label>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      onCheckToggle(item.id, e.target.checked);
    });

    ul.appendChild(li);
  });

  container.appendChild(ul);
}

/**
 * Show error inline panel with custom error messages
 */
export function displayError(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) return;

  if (message) {
    errorContainer.textContent = message;
    errorContainer.classList.add('show');
    
    // Auto-dismiss in 6s
    setTimeout(() => {
      errorContainer.classList.remove('show');
    }, 6000);
  } else {
    errorContainer.classList.remove('show');
  }
}

/**
 * Toggle the loading overlay visibility
 * @param {boolean} show - Whether to show the loading overlay
 */
export function toggleLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  if (show) {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  } else {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

