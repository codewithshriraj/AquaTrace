/**
 * CARTO Basemaps Configuration & API Key Provider
 * Provides authenticated CARTO tile endpoints for high-performance dark tactical
 * and voyager maritime charting across AquaTrace maps.
 */

export const CARTO_API_KEY = 
  import.meta.env.VITE_CARTO_API_KEY || 
  'cb1_3z8u_1_56459bc4049f2d763e28f135';

export const CARTO_BASEMAPS = {
  // Dark Matter (Tactical Maritime Navigation)
  darkMatter: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  darkMatterNoLabels: `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  darkMatterOnlyLabels: `https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  
  // Voyager (Detailed Ports & Coastal Navigation)
  voyager: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  voyagerNoLabels: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  voyagerOnlyLabels: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  
  // Positron (High-Contrast Analytical Light Mode)
  positron: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  positronNoLabels: `https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
  positronOnlyLabels: `https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
};

export const getCartoBasemapUrl = (
  style: 'dark' | 'voyager' | 'positron' = 'dark',
  labels: 'all' | 'none' | 'labels-only' = 'all'
): string => {
  if (style === 'voyager') {
    if (labels === 'none') return CARTO_BASEMAPS.voyagerNoLabels;
    if (labels === 'labels-only') return CARTO_BASEMAPS.voyagerOnlyLabels;
    return CARTO_BASEMAPS.voyager;
  }
  if (style === 'positron') {
    if (labels === 'none') return CARTO_BASEMAPS.positronNoLabels;
    if (labels === 'labels-only') return CARTO_BASEMAPS.positronOnlyLabels;
    return CARTO_BASEMAPS.positron;
  }
  if (labels === 'none') return CARTO_BASEMAPS.darkMatterNoLabels;
  if (labels === 'labels-only') return CARTO_BASEMAPS.darkMatterOnlyLabels;
  return CARTO_BASEMAPS.darkMatter;
};
