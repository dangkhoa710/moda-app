import { useEffect, useState } from 'react';
import {Button, Col, List, Modal, Row, Typography, message, Pagination} from 'antd';
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

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const paginatedData = locations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);


  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => navigate('/menu')} style={{ marginBottom: 16 }}>
        ← Quay lại
      </Button>

      <Title level={3}>Gợi ý nơi lưu trú gần bạn</Title>

      <Row  justify="space-between" align="middle" style={{marginBottom: 16}}>
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
        id="sdasd"
        bordered
        dataSource={paginatedData}
        renderItem={(item, index) => {
          const distance = formatDistance(item.distance ?? 0);
          const time = estimateTravelTime(item.distance ?? 0);
          const {value: distanceVal, unit: distanceUnit} = formatDistance(item.distance ?? 0);

          return (
            <List.Item
              style={{
                border: '1px solid #ddd',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: activeIndex === index ? '#e6f7ff' : 'white', // Màu nền khi active
                color: activeIndex === index ? '#1890ff' : 'black',           // Màu chữ khi active
              }}
              onClick={() => {
                if (!pos) {
                  message.warning('Không xác định được vị trí hiện tại.');
                  return;
                }

                setActiveIndex(index); // Cập nhật item đang được chọn

                const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${item.lat},${item.lng}`;
                window.location.href = url;
              }}
            >
              <div style={{width: '100%'}}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  color: '#1890ff',
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 16
                }}>{item.name}</div>
                <Row style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
                  <Col span={12} style={{fontSize: 16}}>Cách {distanceVal} {distanceUnit}
                  </Col>
                  <Col span={12} style={{fontSize: 16}}>
                    <h3>
                      {`khoảng ${time} phút chạy xe`}
                    </h3>
                  </Col>
                  <div style={{
                    width: '100%',
                    fontSize: 18,
                    color: '#003366',
                    marginBottom: 8,
                    padding: 8,
                    backgroundColor: '#E0EEEE',
                  }}>📍 {item.address}</div>
                  <div style={{fontWeight: 'bold', fontSize: 16, color: '#BB0000', marginBottom: 8}}>{item.note}</div>
                </Row>
              </div>
            </List.Item>
          );
        }}
        style={{maxWidth: '100%', marginTop: 16}}
      />
    </div>
  );
}
