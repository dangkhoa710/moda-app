import { LocationItem } from '../services/locationService';

export const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}; // điều chỉnh đúng path

export function getNearestLocation(
  current: { lat: number; lng: number },
  locations: LocationItem[]
): LocationItem | null {
  if (!current || !locations || locations.length === 0) return null;

  let minDistance = Infinity;
  let nearest: LocationItem | null = null;

  for (const location of locations) {
    const dist = getDistanceKm(
      current.lat,
      current.lng,
      location.lat,
      location.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = location;
    }
  }

  return nearest;
}

