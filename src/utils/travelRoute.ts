import { LocationItem, readLocationsFromGoogleSheetWithoutDistance } from '../services/locationService';
import { getDistanceKm } from "./location";

interface TravelItem {
  fromTime: string;
  toTime: string;
  target: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  location_note?: string;
}

export const generateTravelSchedule = async (
  scheduleData: TravelItem[],
  currentLocation: { lat: number; lng: number } | null
): Promise<TravelItem[]> => {
  const updatedSchedule: TravelItem[] = [];
  const visitedLocations: Set<string> = new Set(); // Set để lưu các ID của địa điểm đã chọn

  for (const item of scheduleData) {
    let targetLocation: LocationItem | null = null;

    if (item.target === 'An') {
      const diningLocations = await readLocationsFromGoogleSheetWithoutDistance(
        process.env.REACT_APP_GOOGLE_SHEET_ID!,
        'Ăn'
      );

      // Loại bỏ các địa điểm đã được chọn trong các lần trước
      const availableDiningLocations = diningLocations.filter(location => !visitedLocations.has(String(location.id)));
      targetLocation = getNearestLocation(currentLocation, availableDiningLocations);

      if (targetLocation) {
        item.location_name = targetLocation.name;
        item.location_lat = targetLocation.lat;
        item.location_lng = targetLocation.lng;
        item.location_address = `${targetLocation.lat}, ${targetLocation.lng}`;
        item.location_note = targetLocation.note;

        updatedSchedule.push(item);
        visitedLocations.add(String(targetLocation.id)); // Đánh dấu địa điểm đã được chọn

        // Cập nhật currentLocation với địa điểm ăn uống gần nhất
        currentLocation = { lat: targetLocation.lat, lng: targetLocation.lng };
      }
    }
    else if (item.target === 'Di') {
      const leisureLocations = await readLocationsFromGoogleSheetWithoutDistance(
        process.env.REACT_APP_GOOGLE_SHEET_ID!,
        'Đi'
      );

      // Loại bỏ các địa điểm đã được chọn trong các lần trước
      const availableLeisureLocations = leisureLocations.filter(location => !visitedLocations.has(String(location.id)));
      targetLocation = getNearestLocation(currentLocation, availableLeisureLocations);

      if (targetLocation) {
        item.location_name = targetLocation.name;
        item.location_lat = targetLocation.lat;
        item.location_lng = targetLocation.lng;
        item.location_address = `${targetLocation.lat}, ${targetLocation.lng}`;
        item.location_note = targetLocation.note;

        updatedSchedule.push(item);
        visitedLocations.add(String(targetLocation.id)); // Đánh dấu địa điểm đã được chọn

        // Cập nhật currentLocation với địa điểm đi chơi gần nhất
        currentLocation = { lat: targetLocation.lat, lng: targetLocation.lng };
      }
    }
  }

  return updatedSchedule;
};

const getNearestLocation = (currentLocation: { lat: number; lng: number } | null, locationList: LocationItem[]): LocationItem | null => {
  if (!currentLocation) {
    return null;
  }

  let nearestLocation: LocationItem | null = null;
  let shortestDistance = Infinity;

  locationList.forEach((location) => {
    const distance = getDistanceKm(currentLocation.lat, currentLocation.lng, location.lat, location.lng);
    if (distance < shortestDistance) {
      nearestLocation = location;
      shortestDistance = distance;
    }
  });

  return nearestLocation;
};
