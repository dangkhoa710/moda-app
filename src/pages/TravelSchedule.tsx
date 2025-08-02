import { useEffect, useState } from 'react';
import { generateTravelSchedule } from "../utils/travelRoute";
import { getCurrentPosition } from "../utils/geo";

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

const TravelSchedule = () => {
  const [schedule, setSchedule] = useState<TravelItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const array: TravelItem[] = [
    {
      "fromTime": "07:00:00",
      "toTime": "08:00:00",
      "target": "An"
    },
    {
      "fromTime": "08:00:00",
      "toTime": "12:00:00",
      "target": "Di"
    },
    {
      "fromTime": "12:00:00",
      "toTime": "13:00:00",
      "target": "An"
    },
    {
      "fromTime": "13:00:00",
      "toTime": "16:00:00",
      "target": "Di"
    },
    {
      "fromTime": "16:00:00",
      "toTime": "19:00:00",
      "target": "Di"
    },
    {
      "fromTime": "20:00:00",
      "toTime": "22:00:00",
      "target": "An"
    },
    {
      "fromTime": "22:00:00",
      "toTime": "23:00:00",
      "target": "Di"
    },
  ];

  useEffect(() => {
    const fetchCurrentPosition = async () => {
      try {
        const position = await getCurrentPosition();
        setCurrentLocation(position);  // Lưu vị trí vào state
      } catch (error) {
        console.error('Không thể lấy vị trí hiện tại:', error);
      }
    };

    fetchCurrentPosition();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      const fetchSchedule = async () => {
        const updatedSchedule = await generateTravelSchedule(array, currentLocation);

        setSchedule(updatedSchedule);
      };

      fetchSchedule();
    }
  }, [currentLocation]);

  return (
    <div>
      <h2>Travel Schedule</h2>
      <pre>{JSON.stringify(schedule, null, 2)}</pre>
    </div>
  );
};

export default TravelSchedule;
