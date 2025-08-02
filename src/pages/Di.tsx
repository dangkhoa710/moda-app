import { useEffect, useState } from 'react';
import { Button, Col, List, Modal, Row, Typography, message, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LocationItem, readLocationsFromGoogleSheet } from '../services/locationService';
import { useCurrentPosition } from '../hooks/useCurrentPositon';
import { estimateTravelTime, formatDistance } from '../utils/format';
import { useWatchPositionWithPrompt } from '../hooks/useWatchPositionWithPrompt';
import {geminiPromptTemplateDi} from "../templates/geminiPromptTemplateDi";
import {getFieldFromStorage} from "../utils/localStorage";
import dayjs from "dayjs";
import {generateGemini} from "../api/geminiService";

const { Title } = Typography;

export default function Di() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const paginatedData = locations.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [suggestedRestaurant, setSuggestedRestaurant] = useState<LocationItem | null>(null);
  const distanceInfoSuggest = formatDistance(suggestedRestaurant?.distance ?? 0);

  const pos = useCurrentPosition();
  const {
    updatedPos,
    shouldUpdate,
    confirmUpdate,
    cancelUpdate,
  } = useWatchPositionWithPrompt(pos);

  const fetchNewData = async (position: { lat: number; lng: number }) => {
    try {
      const data = await readLocationsFromGoogleSheet(
        process.env.REACT_APP_GOOGLE_SHEET_ID!,
        position.lat,
        position.lng,
        'Đi'
      );

      const restaurantList = data.map(d => ({name: d.name, id: d.id}));
      const prompt = geminiPromptTemplateDi({
        gender: getFieldFromStorage('moda_user_info', 'gender') ?? '',
        birthdate: getFieldFromStorage('moda_user_info', 'dob') ?? '',
        mbti: getFieldFromStorage('moda_user_info', 'mbti') ?? '',
        temperature: getFieldFromStorage('moda_weather_data', 'data.main.temp') ?? '',
        weather: getFieldFromStorage('moda_weather_data', 'data.weather.0.description') ?? '',
        currentTime:  dayjs().format('hh:mm A'),
        restaurantList
      });

      const suggestion = await generateGemini(prompt);

      if (suggestion) {
        const id = suggestion ? parseInt(suggestion) : null;
        const result = data.find(item => Number(item.id) === id);
        if (result) {
          setSuggestedRestaurant(result);
        }
        console.log(suggestedRestaurant);
      } else {
        console.warn("No suggestion returned from Gemini.");
      }

      setLocations(data);
    } catch (err) {
      message.error('Không thể đọc dữ liệu địa điểm.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!pos) return;
    fetchNewData(pos);
  }, [pos]);

  useEffect(() => {
    if (updatedPos && shouldUpdate) {
      Modal.confirm({
        title: '📍 Bạn đã di chuyển đến vị trí mới',
        content: 'Bạn có muốn cập nhật lại danh sách gợi ý không?',
        onOk: () => {
          confirmUpdate();
          fetchNewData(updatedPos);
        },
        onCancel: () => cancelUpdate(),
      });
    }
  }, [shouldUpdate, updatedPos]);

  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => navigate('/menu')} style={{ marginBottom: 16 }}>
        ← Quay lại
      </Button>
      <Title level={3}>Gợi ý ăn uống hôm nay : </Title>
      {suggestedRestaurant && (
        <div style={{width: '100%', border: '2px solid #ddd', marginBottom: 32}}
             onClick={() => {
               if (!pos) {
                 message.warning('Không xác định được vị trí hiện tại.');
                 return;
               }

               const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${suggestedRestaurant.lat},${suggestedRestaurant.lng}`;
               window.location.href = url;
             }}
        >
          <div style={{
            fontWeight: 'bold',
            fontSize: 20,
            color: '#1890ff',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16
          }}>{suggestedRestaurant.name}</div>
          <Row style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
            <Col span={12} style={{fontSize: 16}}>
              Cách {distanceInfoSuggest.value} {distanceInfoSuggest.unit}
            </Col>
            <Col span={12} style={{fontSize: 16}}>
              <h3>khoảng {estimateTravelTime(suggestedRestaurant.distance ?? 0)} phút chạy xe</h3>
            </Col>
            <div style={{
              width: '100%',
              fontSize: 18,
              color: '#003366',
              marginBottom: 8,
              padding: 8,
              backgroundColor: '#E0EEEE',
            }}>📍 {suggestedRestaurant.address}</div>
            <div style={{fontWeight: 'bold', fontSize: 16, color: '#BB0000', marginBottom: 8}}>
              {suggestedRestaurant.note || ''}
            </div>
          </Row>
        </div>
      )}

      <Title style={{marginTop: 16}} level={3}>Địa điểm vui chơi gần bạn : </Title>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={3}></Title></Col>
        <Col>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={locations.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </Col>
      </Row>

      <List
        bordered
        dataSource={paginatedData}
        renderItem={(item, index) => {
          const distance = formatDistance(item.distance ?? 0);
          const time = estimateTravelTime(item.distance ?? 0);
          const { value: distanceVal, unit: distanceUnit } = formatDistance(item.distance ?? 0);

          return (
            <List.Item
              style={{
                border: '1px solid #ddd',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: activeIndex === index ? '#e6f7ff' : 'white',
                color: activeIndex === index ? '#1890ff' : 'black',
              }}
              onClick={() => {
                if (!pos) {
                  message.warning('Không xác định được vị trí hiện tại.');
                  return;
                }
                setActiveIndex(index);
                const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${item.lat},${item.lng}`;
                window.location.href = url;
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 'bold', fontSize: 20, color: '#1890ff', paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>{item.name}</div>
                <Row style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                  <Col span={12} style={{ fontSize: 16 }}>Cách {distanceVal} {distanceUnit}</Col>
                  <Col span={12} style={{ fontSize: 16 }}>
                    <h3>{`khoảng ${time} phút chạy xe`}</h3>
                  </Col>
                  <div style={{ width: '100%', fontSize: 18, color: '#003366', marginBottom: 8, padding: 8, backgroundColor: '#E0EEEE' }}>📍 {item.address}</div>
                  <div style={{ fontWeight: 'bold', fontSize: 16, color: '#BB0000', marginBottom: 8 }}>{item.note}</div>
                </Row>
              </div>
            </List.Item>
          );
        }}
        style={{ maxWidth: '100%', marginTop: 16 }}
      />
    </div>
  );
}