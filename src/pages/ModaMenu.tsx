import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchWeatherByCity, WeatherData } from '../api/weatherService';

const { Title } = Typography;

const WEATHER_STORAGE_KEY = 'moda_weather_data';

export default function ModaMenu() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(WEATHER_STORAGE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === today && parsed.data) {
        setWeather(parsed.data);
        setLoading(false);
        return;
      }
    }

    const fetchWeather = async () => {
      const data = await fetchWeatherByCity('Da Nang');
      if (data) {
        setWeather(data);
        localStorage.setItem(
          WEATHER_STORAGE_KEY,
          JSON.stringify({ date: today, data })
        );
      } else {
        message.error('Không thể tải dữ liệu thời tiết');
      }
      setLoading(false);
    };

    fetchWeather();
  }, []);

  const cards = [
    { title: 'Gợi ý lịch trình', path: '/suggestion', color: '#F28076',span:24 },
    { title: 'Mặc', path: '/mac', color: '#FFB6AF',span:12 },
    { title: 'Ở', path: '/owr', color: '#FAE0C7',span:12 },
    { title: 'Đi', path: '/di', color: '#FBC193',span:12 },
    { title: 'Ăn', path: '/an', color: '#4EB09B',span:12 },
  ];

  return (
    <div style={{ padding: 32, backgroundColor: '#f0f2f5', minHeight: '100vh' ,display:'flex',justifyContent:'center', alignItems:'center' }}>
      <div style={{ minWidth: '66.6667vw',textAlign: 'center' }}>
      <Title level={2} style={{marginBottom:32}}>Chào mừng bạn đến với MODA</Title>

      {loading ? (
        <Spin tip="Đang tải thời tiết..." />
      ) : weather ? (
        <div style={{ marginBottom: 24, background: '#f0f5ff', padding: 16, borderRadius: 8 }}>
          <Title level={4}>📍 {weather.name}</Title>
          <p style={{ margin: 0 }}>🌤 {weather.weather[0].description}</p>
          <p style={{ margin: 0 }}>🌡 Nhiệt độ: {Math.round(weather.main.temp)}°C</p>
        </div>
      ) : null}

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col span={card.span} key={card.title}>
            <Card
              hoverable
              style={{ textAlign: 'center', backgroundColor: card.color, color: 'white', fontSize: 30 }}
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