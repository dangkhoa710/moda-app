import { Timeline } from "antd";
import { Schedule } from "./TimeLineList";
import { ScheduleItem } from "./ScheduleItem";
import { ClockCircleOutlined } from "@ant-design/icons";
import { DOT_COLORS } from "../constants/Suggestion";
import { useCurrentPosition } from "../hooks/useCurrentPositon";
import { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export interface SchedulesProps {
  schedules: Schedule[];
}
export function Schedules(props: SchedulesProps) {
  const navigate = useNavigate();

  const { schedules } = props;
  const pos = useCurrentPosition();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const items = schedules.map((schedule, index) => ({
    children: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="time-range">
          {schedule.fromTime} ~ {schedule.toTime}
        </span>
        <ScheduleItem
          pos={pos}
          schedule={schedule}
          index={index}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      </div>
    ),
    dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
    color: DOT_COLORS[4],
  }));

  return (
    <div style={{ padding: "1rem" }}>
      <Timeline items={items} mode="left" />
    </div>
  );

}
