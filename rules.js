/**
 * Packing suggestions rules engine
 * Implements a data-driven rules evaluation strategy
 */

export const packingRules = [
  {
    id: 'rain',
    test: (w) => ['Rain', 'Drizzle', 'Thunderstorm'].includes(w.conditionGroup),
    suggestion: '☔ Pack an umbrella!',
    description: 'Expected rain or drizzle in the area.',
    icon: '☔',
    category: 'Essentials'
  },
  {
    id: 'heavy_rain',
    test: (w) => w.conditionGroup === 'Thunderstorm' || w.description.includes('heavy') || w.description.includes('extreme'),
    suggestion: '🧥 Insulated rain coat',
    description: 'Heavy precipitation or storm conditions forecasted.',
    icon: '🧥',
    category: 'Clothing'
  },
  {
    id: 'heavy_coat',
    test: (w) => w.tempC < 10,
    suggestion: '🧥 Warm heavy coat',
    description: 'Chilly weather below 10°C / 50°F.',
    icon: '🧥',
    category: 'Clothing'
  },
  {
    id: 'gloves',
    test: (w) => w.tempC < 10,
    suggestion: '🧤 Thermal gloves & beanie',
    description: 'Chilly weather below 10°C / 50°F.',
    icon: '🧤',
    category: 'Clothing'
  },
  {
    id: 'light_clothing',
    test: (w) => w.tempC > 30,
    suggestion: '🩳 Light clothing',
    description: 'Hot weather above 30°C / 86°F.',
    icon: '🩳',
    category: 'Clothing'
  },
  {
    id: 'sunscreen',
    test: (w) => w.tempC > 30 || w.conditionGroup === 'Clear',
    suggestion: '🧴 Sunscreen (SPF 50+)',
    description: 'High UV exposure expected under sunny/hot skies.',
    icon: '🧴',
    category: 'Essentials'
  },
  {
    id: 'breathable',
    test: (w) => w.humidity > 70 && w.tempC >= 20,
    suggestion: '💨 Breathable fabrics',
    description: 'High humidity (>70%) and warm temperatures.',
    icon: '💨',
    category: 'Essentials'
  },
  {
    id: 'boots',
    test: (w) => w.conditionGroup === 'Snow',
    suggestion: '🥾 Waterproof boots',
    description: 'Snowy conditions on the ground.',
    icon: '🥾',
    category: 'Footwear'
  },
  {
    id: 'windy',
    test: (w) => w.windSpeed > 10, // 10 m/s is strong wind
    suggestion: '🧥 Windbreaker jacket',
    description: 'High wind speeds (>10 m/s) forecasted.',
    icon: '🧥',
    category: 'Clothing'
  },
  {
    id: 'sunglasses',
    test: (w) => w.conditionGroup === 'Clear',
    suggestion: '🕶️ Sunglasses',
    description: 'Clear sunny skies forecasted.',
    icon: '🕶️',
    category: 'Essentials'
  }
];

/**
 * Evaluates the weather object against all packing rules
 * @param {Object} weather - Normalized weather object
 * @returns {Array} List of suggestions matching the rules
 */
export function evaluateRules(weather) {
  if (!weather) return [];
  
  return packingRules
    .filter(rule => rule.test(weather))
    .map(rule => ({
      id: rule.id,
      suggestion: rule.suggestion,
      description: rule.description,
      icon: rule.icon,
      category: rule.category
    }));
}
