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
  const isRest = schedule.target === "Off";

  return (
    <div
      style={{
        borderRadius: "0.5rem",
        border: "1px solid #ddd",
        padding: 0,
        cursor: isRest ? "default" : "pointer",
        backgroundColor: activeIndex === index ? "#e6f7ff" : "white",
        color: activeIndex === index ? "#1890ff" : "black",
      }}
      onClick={() => {
        if (isRest) return;

        if (!pos) {
          message.warning("Không xác định được vị trí hiện tại.");
          return;
        }

        setActiveIndex(index);

        const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.lat},${pos.lng}&destination=${schedule.location_lat},${schedule.location_lng}`;
        window.location.href = url;
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Title */}
        <div
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: isRest ? "#4EB09B" : "#1890ff",
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16,
            textAlign: isRest ? "center" : "left",
          }}
        >
          {isRest ? "🛌 Nghỉ ngơi" : schedule.location_name}
        </div>

        {!isRest && (
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
        )}

        {isRest && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#666",
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "#f6ffed",
              borderTop: "1px dashed #ccc",
              borderRadius: "0 0 0.5rem 0.5rem",
            }}
          >
            ⏳ Đây là khoảng thời gian để bạn nghỉ ngơi, thư giãn và tái tạo năng lượng.
          </div>
        )}
      </div>
    </div>
  );
}

