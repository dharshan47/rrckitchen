import { THANJAVUR_BOUNDS } from "./thanjavur-bounds";

export function isWithinThanjavur(lat: number, lng: number) {
  return (
    lat >= THANJAVUR_BOUNDS.south &&
    lat <= THANJAVUR_BOUNDS.north &&
    lng >= THANJAVUR_BOUNDS.west &&
    lng <= THANJAVUR_BOUNDS.east
  );
}
