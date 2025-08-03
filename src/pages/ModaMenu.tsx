import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Spin, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchWeatherByCity, WeatherData } from "../api/weatherService";
// import { getCurrentPosition } from '../utils/geo';
import { useCurrentPosition } from "../hooks/useCurrentPositon";
import { useWatchPositionWithPrompt } from "../hooks/useWatchPositionWithPrompt";
import removeVietnameseTones from "../utils/removeVietnamTones";
import { cleanCityName } from "../utils/languages";

const { Title } = Typography;
const WEATHER_STORAGE_KEY = "moda_weather_data";

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BE_URL}/api/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "ModaApp/1.0 (hoaitrung.2k2@example.com)",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      null
    );
  } catch (err) {
    console.error("❌ Reverse geocode failed:", err);
    return null;
  }
}

export default function ModaMenu() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const position = useCurrentPosition();
  const { updatedPos, shouldUpdate, confirmUpdate, cancelUpdate } =
    useWatchPositionWithPrompt(position);

  const fetchWeatherForLocation = async (lat: number, lng: number) => {
    const today = new Date().toISOString().slice(0, 10);

    const cached = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (
        parsed.date === today &&
        parsed.data?.lat === lat &&
        parsed.data?.lng === lng
      ) {
        setWeather(parsed.data.weather);
        setLoading(false);
        return;
      }
    }

    const cityName = await reverseGeocode(lat, lng);
    if (!cityName) {
      message.error("Không thể xác định vị trí thành phố.");
      setLoading(false);
      return;
    }
    const cityNoFurther = cleanCityName(cityName);
    const cityNoAccent = removeVietnameseTones(cityNoFurther);
    const weatherData = await fetchWeatherByCity(cityNoAccent);
    if (weatherData) {
      setWeather(weatherData);
      localStorage.setItem(
        WEATHER_STORAGE_KEY,
        JSON.stringify({
          date: today,
          data: { lat, lng, city: cityName, weather: weatherData },
        })
      );
    } else {
      message.error("Không thể tải dữ liệu thời tiết.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (position) {
      fetchWeatherForLocation(position.lat, position.lng);
    }
  }, [position]);

  useEffect(() => {
    if (shouldUpdate && updatedPos) {
      Modal.confirm({
        title: "Bạn đã di chuyển?",
        content:
          "Vị trí của bạn đã thay đổi hơn 300m. Bạn có muốn cập nhật lại thời tiết không?",
        onOk: () => {
          fetchWeatherForLocation(updatedPos.lat, updatedPos.lng);
          confirmUpdate();
        },
        onCancel: cancelUpdate,
      });
    }
  }, [shouldUpdate, updatedPos]);

  const cards = [
    { title: "Gợi ý lịch trình", path: "/goiy", color: "#4EB09B", span: 24 },
    { title: "Mặc", path: "/mac", color: "#FFB6AF", span: 12 },
    { title: "Ở", path: "/owr", color: "#FAE0C7", span: 12 },
    { title: "Đi", path: "/di", color: "#FBC193", span: 12 },
    { title: "Ăn", path: "/an", color: "#F28076", span: 12 },
  ];

  return (
    <div
      style={{
        padding: 32,
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ minWidth: "66.6667vw", textAlign: "center" }}>
        <Title level={2} style={{ marginBottom: 32 }}>
          Chào mừng bạn đến với MODA
        </Title>

        {loading ? (
          <Spin tip="Đang tải thời tiết..." />
        ) : weather ? (
          <div
            style={{
              marginBottom: 24,
              background: "#f0f5ff",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Title level={4}>📍 {weather.name}</Title>
            <p style={{ margin: 0 }}>🌤 {weather.weather[0].description}</p>
            <p style={{ margin: 0 }}>
              🌡 Nhiệt độ: {Math.round(weather.main.temp)}°C
            </p>
          </div>
        ) : null}

        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col span={card.span} key={card.title}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  backgroundColor: card.color,
                  color: "white",
                  fontSize: 30,
                }}
                onClick={() => navigate(card.path)}
              >
                {card.title}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
