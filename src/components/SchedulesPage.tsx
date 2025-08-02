import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Schedules } from "../components/Schedules";
import { Schedule } from "../components/TimeLineList";
import { Button } from "antd";

const SCHEDULE_KEY = "moda_schedule";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cached = localStorage.getItem(SCHEDULE_KEY);
    if (cached) {
      setSchedules(JSON.parse(cached));
    } else {
      navigate("/suggestion"); // Không có -> quay về tạo mới
    }
  }, []);

  return (
    <div style={{padding: 24}}>
      <div style={{textAlign: "left", marginBottom: 16}}>
        <Button onClick={() => navigate("/menu")} style={{marginBottom: 8}}>
          ← Quay lại
        </Button>
      </div>
      <div style={{textAlign: "right", marginBottom: 16}}>
        <Button style={{ backgroundColor: "#2d6a5c" , color:"#fff", borderColor: "#2d6a5c", fontWeight:"bold", marginRight: "0.5rem" }} onClick={() => navigate("/suggestion")}>
          ✏️ Chỉnh sửa lịch trình
        </Button>
        <Button
          style={{ backgroundColor: "#F28076" , color:"#fff", borderColor: "#F28076", fontWeight:"bold"}}
          onClick={() => {
            localStorage.removeItem("moda_schedule");
            navigate("/suggestion");
          }}
        >
          🗑 Xoá và tạo lại lịch trình
        </Button>
      </div>
      <Schedules schedules={schedules}/>
    </div>
  );
}
