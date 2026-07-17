import { WEATHER_THEMES } from './config.js';

/**
 * Updates CSS custom properties on the :root element based on the weather conditions
 * @param {string} conditionGroup - The main condition (e.g. 'Clear', 'Rain', 'Clouds', etc.)
 * @param {number} tempC - Current temperature in Celsius
 */
export function applyWeatherTheme(conditionGroup, tempC) {
  let theme = WEATHER_THEMES.DEFAULT;

  const normalizedGroup = conditionGroup ? conditionGroup.toLowerCase() : '';

  if (normalizedGroup === 'clear') {
    // If Clear + hot (>= 28°C), use warm orange tones, otherwise slightly lighter clear theme
    theme = WEATHER_THEMES.CLEAR;
  } else if (['rain', 'drizzle', 'thunderstorm'].includes(normalizedGroup)) {
    theme = normalizedGroup === 'thunderstorm' ? WEATHER_THEMES.THUNDERSTORM : WEATHER_THEMES.RAINY;
  } else if (normalizedGroup === 'snow') {
    theme = WEATHER_THEMES.SNOWY;
  } else if (normalizedGroup === 'clouds' || normalizedGroup === 'mist' || normalizedGroup === 'fog' || normalizedGroup === 'haze') {
    theme = WEATHER_THEMES.CLOUDY;
  }

  // Set the CSS Custom Properties on documentElement (:root)
  const root = document.documentElement;
  root.style.setProperty('--bg-gradient', theme.gradientStart);
  root.style.setProperty('--accent-color', theme.accentColor);

  // Update theme class on body for any conditional styling if needed
  // (We clean up other theme classes first)
  Object.values(WEATHER_THEMES).forEach(t => {
    document.body.classList.remove(t.className);
  });
  document.body.classList.add(theme.className);

  return theme.name;
}
