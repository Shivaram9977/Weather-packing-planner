/**
 * Configuration and constants for the Weather & Packing Planner application
 */

export const STORAGE_KEYS = {
  API_KEY: 'weather_planner_api_key',
  SEARCH_HISTORY: 'weather_planner_search_history',
  UNIT: 'weather_planner_temp_unit' // 'C' or 'F'
};

export const DEFAULT_CITIES = ['London', 'New York', 'Tokyo', 'Cairo', 'Sydney'];

export const WEATHER_THEMES = {
  CLEAR: {
    name: 'clear',
    gradientStart: 'linear-gradient(135deg, #ff9966, #ff5e62)',
    accentColor: '#ff773d',
    className: 'theme-clear'
  },
  CLOUDY: {
    name: 'cloudy',
    gradientStart: 'linear-gradient(135deg, #617ca6, #8ca6c9)',
    accentColor: '#4f72a3',
    className: 'theme-cloudy'
  },
  RAINY: {
    name: 'rainy',
    gradientStart: 'linear-gradient(135deg, #2b5876, #4e4376)',
    accentColor: '#4b75a4',
    className: 'theme-rainy'
  },
  SNOWY: {
    name: 'snowy',
    gradientStart: 'linear-gradient(135deg, #83a4d4, #b6fbff)',
    accentColor: '#4ea8de',
    className: 'theme-snowy'
  },
  THUNDERSTORM: {
    name: 'thunderstorm',
    gradientStart: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    accentColor: '#7b2cbf',
    className: 'theme-thunderstorm'
  },
  DEFAULT: {
    name: 'default',
    gradientStart: 'linear-gradient(135deg, #3a7bd5, #3a6073)',
    accentColor: '#3a7bd5',
    className: 'theme-default'
  }
};
