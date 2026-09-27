// Accurate regional coastal outlines for maritime GIS context (SIH 26143)
// Provides instant self-contained nautical landmasses and graticules with zero API key dependencies

export interface CoastalFeature {
  name: string;
  polygon: [number, number][]; // [lat, lng]
}

export const regionalCoastlines: CoastalFeature[] = [
  // 1. Indian West Coast (Gujarat through Maharashtra, Goa, Karnataka, Kerala)
  {
    name: 'India — West Coast & Peninsula',
    polygon: [
      [24.0, 68.8],
      [23.5, 68.5],
      [22.8, 69.1], // Gulf of Kachchh north
      [22.9, 70.2],
      [22.5, 70.3],
      [22.3, 69.1], // Dwarka
      [21.6, 69.6], // Porbandar
      [20.7, 70.9], // Diu
      [21.2, 72.1], // Gulf of Khambhat
      [21.7, 72.3],
      [21.2, 72.8], // Surat
      [20.1, 72.8], // Daman
      [19.0, 72.82], // Mumbai / JNPT
      [18.5, 72.95], // Alibaug
      [17.0, 73.28], // Ratnagiri
      [15.5, 73.75], // Goa / Mormugao
      [14.8, 74.12], // Karwar
      [13.3, 74.74], // Malpe
      [12.8, 74.83], // Mangalore
      [11.2, 75.77], // Kozhikode
      [9.93, 76.26], // Kochi
      [8.50, 76.95], // Vizhinjam
      [8.08, 77.55], // Kanyakumari
      // Inland closure to form solid landmass on the east
      [8.08, 85.0],
      [24.0, 85.0],
      [24.0, 68.8],
    ],
  },

  // 2. Sri Lanka (for Gulf of Mannar case OS-037)
  {
    name: 'Sri Lanka',
    polygon: [
      [9.83, 80.25], // Point Pedro
      [9.35, 80.40],
      [8.75, 81.22], // Trincomalee
      [7.72, 81.70], // Batticaloa
      [6.90, 81.85],
      [6.05, 80.22], // Galle
      [6.93, 79.84], // Colombo
      [7.98, 79.82], // Kalpitiya
      [8.98, 79.91], // Mannar Island
      [9.83, 80.25],
    ],
  },

  // 3. Indian East Coast (Tamil Nadu, Andhra Pradesh, Odisha)
  {
    name: 'India — East Coast Corridor',
    polygon: [
      [8.08, 77.55],
      [9.28, 79.13], // Rameswaram
      [10.35, 79.85], // Point Calimere
      [11.93, 79.83], // Puducherry
      [13.08, 80.27], // Chennai Port
      [14.28, 80.12], // Krishnapatnam
      [15.82, 80.35],
      [16.98, 82.25], // Kakinada
      [17.68, 83.22], // Visakhapatnam
      [19.80, 85.83], // Puri
      [20.30, 86.70], // Paradip
      [21.60, 87.50], // Haldia / WB
      [24.0, 87.50],
      [24.0, 77.55],
      [8.08, 77.55],
    ],
  },

  // 4. Strait of Malacca — Peninsular Malaysia & Singapore
  {
    name: 'Peninsular Malaysia',
    polygon: [
      [6.45, 100.18],
      [5.42, 100.33], // Penang
      [4.22, 100.60], // Lumut
      [3.00, 101.40], // Port Klang
      [2.19, 102.25], // Melaka
      [1.46, 103.76], // Johor / Singapore
      [1.46, 105.0],
      [6.45, 105.0],
      [6.45, 100.18],
    ],
  },

  // 5. Strait of Malacca — Sumatra (Indonesia)
  {
    name: 'Sumatra (Indonesia)',
    polygon: [
      [5.55, 95.32], // Banda Aceh
      [5.20, 96.15],
      [4.10, 98.15],
      [3.78, 98.68], // Belawan / Medan
      [2.05, 100.80], // Dumai
      [1.00, 102.50],
      [1.00, 95.0],
      [5.55, 95.0],
      [5.55, 95.32],
    ],
  },
];
