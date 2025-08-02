import { useEffect, useState } from 'react';
import { Button, Col, List, Modal, Row, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LocationItem, readLocationsFromGoogleSheet } from '../services/locationService';
import { useCurrentPosition } from '../hooks/useCurrentPositon';
import { estimateTravelTime, formatDistance } from '../utils/format';
import { useWatchPositionWithPrompt } from '../hooks/useWatchPositionWithPrompt';

const { Title } = Typography;

export default function Ows() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
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
        'Ở'
      );
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

      <Title level={3}>Gợi ý nơi lưu trú gần bạn</Title>

      <List
        bordered
        dataSource={locations}
        renderItem={(item) => {
          const distance = formatDistance(item.distance ?? 0);
          const time = estimateTravelTime(item.distance ?? 0);
          const { value: distanceVal, unit: distanceUnit } = formatDistance(item.distance ?? 0);

          return (
            <List.Item 
            style={{ border: '1px solid #ddd', padding: 16 }}
            onClick={() => {
              if (!pos) {
                message.warning('Không xác định được vị trí hiện tại.');
                return;
              }
            
              const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${item.lat},${item.lng}`;
              window.location.href = url; 
            }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: '#1890ff', marginBottom: 8 }}>{item.name}</div>
                <Row>
                <Col span={12} style={{ fontSize: 16 }}>📍 cách {distanceVal} {distanceUnit}
                </Col>
                  <Col span={12} style={{ fontSize: 16 }}>
                    <h3>
                      {`khoảng ${time} phút chạy xe`}
                    </h3>
                  </Col>
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
