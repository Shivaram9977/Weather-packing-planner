import { STORAGE_KEYS, DEFAULT_CITIES } from './config.js';
import { fetchWeather, fetchWeatherByCoords } from './api.js';
import { evaluateRules } from './rules.js';
import { applyWeatherTheme } from './theme.js';
import {
  renderCurrentWeather,
  renderForecast,
  renderHourly,
  renderSearchHistory,
  renderPackingList,
  renderSkeletons,
  displayError,
  toggleLoading
} from './dom.js';

// Application State
const state = {
  currentWeather: null,
  unit: 'C', // 'C' or 'F'
  searchHistory: [],
  checkedPackingItems: {}, // { ruleId: boolean }
  activeFilter: 'All', // 'All', 'Essentials', 'Clothing', 'Footwear'
  apiKey: '',
  activeCity: ''
};

// Safe localStorage wrapper to prevent crashes in sandboxed/private/restricted browsing contexts
const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access blocked:", e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage access blocked:", e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage access blocked:", e);
    }
  }
};

// Initialize Application
async function init() {
  // Load API Key
  state.apiKey = safeStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  
  // Load Unit Preference
  state.unit = safeStorage.getItem(STORAGE_KEYS.UNIT) || 'C';
  
  // Load Search History
  try {
    const savedHistory = safeStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    state.searchHistory = savedHistory ? JSON.parse(savedHistory) : [...DEFAULT_CITIES];
  } catch (e) {
    state.searchHistory = [...DEFAULT_CITIES];
  }

  // Setup Event Listeners
  setupEventListeners();
  
  // Setup Connection Observers
  setupConnectionListeners();

  // Populate settings form with loaded key
  const apiKeyInput = document.getElementById('api-key-input');
  if (apiKeyInput) {
    apiKeyInput.value = state.apiKey;
  }
  
  updateDemoModeNotice();
  updateUnitToggleUI();
  updateConnectionStatus();

  // Trigger Initial Search (First city in history or London)
  const initialCity = state.searchHistory[0] || 'London';
  await performSearch(initialCity);
}

// Set up UI Event Handlers
function setupEventListeners() {
  // Search Form
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const city = searchInput.value.trim();
      if (!city) return;
      
      await performSearch(city);
      searchInput.value = '';
    });
  }

  // Geolocation Button
  const locationBtn = document.getElementById('location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', handleGeolocation);
  }

  // Unit Toggle Buttons
  const unitToggleC = document.getElementById('unit-toggle-c');
  const unitToggleF = document.getElementById('unit-toggle-f');
  
  if (unitToggleC && unitToggleF) {
    unitToggleC.addEventListener('click', () => setTemperatureUnit('C'));
    unitToggleF.addEventListener('click', () => setTemperatureUnit('F'));
  }

  // Settings Slide Panel Toggle
  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsOverlay = document.getElementById('settings-overlay');

  if (settingsBtn && settingsPanel && settingsOverlay) {
    const togglePanel = () => {
      settingsPanel.classList.toggle('open');
      settingsOverlay.classList.toggle('show');
    };
    settingsBtn.addEventListener('click', togglePanel);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', togglePanel);
    settingsOverlay.addEventListener('click', togglePanel);
  }

  // API Key Form Save
  const apiKeyForm = document.getElementById('api-key-form');
  if (apiKeyForm) {
    apiKeyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyInput = document.getElementById('api-key-input');
      const val = keyInput.value.trim();
      
      state.apiKey = val;
      if (val) {
        safeStorage.setItem(STORAGE_KEYS.API_KEY, val);
      } else {
        safeStorage.removeItem(STORAGE_KEYS.API_KEY);
      }
      
      updateDemoModeNotice();
      
      // Notify user of settings saved
      const statusMsg = document.getElementById('settings-status-msg');
      if (statusMsg) {
        statusMsg.textContent = 'Settings saved successfully!';
        statusMsg.classList.add('show');
        setTimeout(() => {
          statusMsg.classList.remove('show');
        }, 3000);
      }

      // Re-trigger current search with new key
      if (state.activeCity) {
        performSearch(state.activeCity);
      }
    });
  }

  // Clear History Button
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      state.searchHistory = [];
      safeStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify([]));
      renderSearchHistory(state.searchHistory, handleHistorySearch);
    });
  }
}

// Setup Online/Offline Listeners
function setupConnectionListeners() {
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

// Display/Hide network status bar
function updateConnectionStatus() {
  const container = document.querySelector('.app-container');
  let offlineBanner = document.getElementById('offline-notification');
  
  if (!navigator.onLine) {
    if (!offlineBanner) {
      offlineBanner = document.createElement('div');
      offlineBanner.id = 'offline-notification';
      offlineBanner.className = 'offline-banner';
      offlineBanner.innerHTML = `
        <span class="offline-icon">⚠️</span>
        <p>You are currently offline. Using offline/cached planner assets.</p>
      `;
      // Insert after header
      const header = document.querySelector('.main-header');
      if (header) {
        header.insertAdjacentElement('afterend', offlineBanner);
      } else {
        container.prepend(offlineBanner);
      }
    }
  } else {
    if (offlineBanner) {
      offlineBanner.remove();
    }
  }
}

// Perform Weather Search
async function performSearch(city) {
  displayError(null);
  
  // Show Skeletons inside cards immediately (Professional loading UX)
  renderSkeletons();
  toggleLoading(true);

  try {
    const data = await fetchWeather(city, state.apiKey);
    
    // Save to state
    state.currentWeather = data;
    state.activeCity = data.city;
    
    // Reset packing list state for new search
    state.checkedPackingItems = {};
    state.activeFilter = 'All';

    // Save to history list
    updateHistory(data.city);

    // Update UI components
    renderAll();
    
    // Shift Theme based on condition
    applyWeatherTheme(data.conditionGroup, data.tempC);

  } catch (err) {
    displayError(err.message || 'An unexpected error occurred.');
    // If search fails, restore current weather view if exists, otherwise clear skeletons
    if (state.currentWeather) {
      renderAll();
    }
  } finally {
    toggleLoading(false);
  }
}

// Handle Geolocation lookup
function handleGeolocation() {
  if (!navigator.geolocation) {
    displayError('Geolocation is not supported by your browser.');
    return;
  }

  displayError(null);
  renderSkeletons();
  toggleLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const data = await fetchWeatherByCoords(latitude, longitude, state.apiKey);
        state.currentWeather = data;
        state.activeCity = data.city;
        
        state.checkedPackingItems = {};
        state.activeFilter = 'All';
        
        updateHistory(data.city);
        renderAll();
        applyWeatherTheme(data.conditionGroup, data.tempC);
      } catch (err) {
        displayError(err.message || 'Failed to retrieve weather for location.');
        if (state.currentWeather) renderAll();
      } finally {
        toggleLoading(false);
      }
    },
    (error) => {
      toggleLoading(false);
      if (state.currentWeather) renderAll();
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          displayError('Location access was denied. Please search manually.');
          break;
        case error.POSITION_UNAVAILABLE:
          displayError('Location information is unavailable.');
          break;
        case error.TIMEOUT:
          displayError('Request to get user location timed out.');
          break;
        default:
          displayError('An unknown error occurred while retrieving location.');
      }
    },
    { timeout: 10000 }
  );
}

// Handle clicking search history pill
async function handleHistorySearch(city) {
  await performSearch(city);
}

// Update local storage history
function updateHistory(city) {
  const formattedCity = city.trim();
  let history = [...state.searchHistory];
  
  history = history.filter(item => item.toLowerCase() !== formattedCity.toLowerCase());
  history.unshift(formattedCity);
  
  if (history.length > 5) {
    history = history.slice(0, 5);
  }
  
  state.searchHistory = history;
  safeStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
  renderSearchHistory(state.searchHistory, handleHistorySearch);
}

// Set Temperature display unit ('C' or 'F')
function setTemperatureUnit(unit) {
  if (state.unit === unit) return;
  
  state.unit = unit;
  safeStorage.setItem(STORAGE_KEYS.UNIT, unit);
  
  updateUnitToggleUI();
  
  if (state.currentWeather) {
    renderCurrentWeather(state.currentWeather, state.unit);
    renderForecast(state.currentWeather.forecast, state.unit);
    renderHourly(state.currentWeather.hourly, state.unit);
  }
}

// Toggle active classes on unit switchers
function updateUnitToggleUI() {
  const unitToggleC = document.getElementById('unit-toggle-c');
  const unitToggleF = document.getElementById('unit-toggle-f');
  
  if (state.unit === 'C') {
    unitToggleC?.classList.add('active');
    unitToggleF?.classList.remove('active');
  } else {
    unitToggleC?.classList.remove('active');
    unitToggleF?.classList.add('active');
  }
}

// Toggle visibility of Demo notice
function updateDemoModeNotice() {
  const demoBanner = document.getElementById('demo-mode-banner');
  if (demoBanner) {
    if (!state.apiKey) {
      demoBanner.classList.add('show');
    } else {
      demoBanner.classList.remove('show');
    }
  }
}

// Handle Checkbox Toggling for packing checklist
function handlePackingCheckToggle(ruleId, isChecked) {
  state.checkedPackingItems[ruleId] = isChecked;
  
  // Re-render checklist with current states
  const suggestions = evaluateRules(state.currentWeather);
  renderPackingList(
    suggestions,
    state.checkedPackingItems,
    state.activeFilter,
    handlePackingCheckToggle,
    handleFilterChange,
    handlePackingBulkAction
  );
}

// Handle Category Filter tab switching
function handleFilterChange(category) {
  state.activeFilter = category;
  
  const suggestions = evaluateRules(state.currentWeather);
  renderPackingList(
    suggestions,
    state.checkedPackingItems,
    state.activeFilter,
    handlePackingCheckToggle,
    handleFilterChange,
    handlePackingBulkAction
  );
}

// Handle Select All / Reset Actions
function handlePackingBulkAction(action) {
  const suggestions = evaluateRules(state.currentWeather);
  
  if (action === 'check_all') {
    suggestions.forEach(item => {
      state.checkedPackingItems[item.id] = true;
    });
  } else if (action === 'reset') {
    suggestions.forEach(item => {
      state.checkedPackingItems[item.id] = false;
    });
  }
  
  renderPackingList(
    suggestions,
    state.checkedPackingItems,
    state.activeFilter,
    handlePackingCheckToggle,
    handleFilterChange,
    handlePackingBulkAction
  );
}

// Multi-component rendering routine
function renderAll() {
  if (!state.currentWeather) return;
  
  renderCurrentWeather(state.currentWeather, state.unit);
  renderForecast(state.currentWeather.forecast, state.unit);
  renderHourly(state.currentWeather.hourly, state.unit);
  renderSearchHistory(state.searchHistory, handleHistorySearch);
  
  const suggestions = evaluateRules(state.currentWeather);
  renderPackingList(
    suggestions,
    state.checkedPackingItems,
    state.activeFilter,
    handlePackingCheckToggle,
    handleFilterChange,
    handlePackingBulkAction
  );
}

// Run app init when DOM content completes
document.addEventListener('DOMContentLoaded', init);
