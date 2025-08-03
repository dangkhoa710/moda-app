// File: src/api/weatherService.ts

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

export const fetchWeatherByCity = async (city: string): Promise<WeatherData | null> => {
  try {
    const res = await fetch(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
    );
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    console.log('Weather data:', data);
    return data;
  } catch (error) {
    console.error('Lỗi fetch thời tiết:', error);
    return null;
  }
};
