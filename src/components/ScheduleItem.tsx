import { Col, message, Row } from "antd";
import { Schedule } from "./TimeLineList";

export interface ScheduleItemProps {
  pos: { lat: number; lng: number } | null;
  index: number;
  activeIndex: number;
  schedule: Schedule;
  setActiveIndex: (index: number) => void;
}

export function ScheduleItem(props: ScheduleItemProps) {
  const { schedule, index, activeIndex, setActiveIndex, pos } = props;
  return (
    <div
      style={{
        borderRadius: "0.5rem",
        border: "1px solid #ddd",
        padding: 0,
        cursor: "pointer",
        backgroundColor: activeIndex === index ? "#e6f7ff" : "white", // Màu nền khi active
        color: activeIndex === index ? "#1890ff" : "black", // Màu chữ khi active
      }}
      onClick={() => {
        if (!pos) {
          message.warning("Không xác định được vị trí hiện tại.");
          return;
        }

        setActiveIndex(index); // Cập nhật item đang được chọn

        const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${schedule.location_lat},${schedule.location_lng}`;
        window.location.href = url;
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: "#1890ff",
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16,
          }}
        >
          {schedule.location_name}
        </div>
        <Row style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
          <div
            style={{
              width: "100%",
              fontSize: 18,
              color: "#003366",
              marginBottom: 8,
              padding: 8,
              backgroundColor: "#E0EEEE",
            }}
          >
            📍 {schedule.location_address}
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#BB0000",
              marginBottom: 8,
            }}
          >
            {schedule.location_note}
          </div>
        </Row>
      </div>
    </div>
  );
}
