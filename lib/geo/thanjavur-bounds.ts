export const THANJAVUR_CENTER: [number, number] = [10.787, 79.137];

export const THANJAVUR_BOUNDS = {
  south: 10.45,
  west: 78.85,
  north: 11.05,
  east: 79.45,
};

export const LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [THANJAVUR_BOUNDS.south, THANJAVUR_BOUNDS.west],
  [THANJAVUR_BOUNDS.north, THANJAVUR_BOUNDS.east],
];

export const NOMINATIM_VIEWBOX = `${THANJAVUR_BOUNDS.west},${THANJAVUR_BOUNDS.north},${THANJAVUR_BOUNDS.east},${THANJAVUR_BOUNDS.south}`;
