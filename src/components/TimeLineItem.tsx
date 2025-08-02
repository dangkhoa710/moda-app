import dayjs from "dayjs";
import { TimePicker, Select, Button } from "antd";
import { FORMAT_TIME } from "../constants/Suggestion";
import { DeleteOutlined } from "@ant-design/icons";
import { InformationState } from "./TimeLineList";

export interface TimeLineItemProps {
  id?: string;
  defaultFromTime?: dayjs.Dayjs | null;
  defaultToTime?: dayjs.Dayjs | null;
  defaultTargetSelected?: string | null;
  handleChangeDefaultInformation?: (
    key: keyof InformationState,
    value: dayjs.Dayjs | null | string
  ) => void;
  handleDeleteItem?: (id: string) => void;
}

export function TimeLineItem(props: TimeLineItemProps) {
  const {
    id,
    defaultFromTime,
    defaultToTime,
    defaultTargetSelected,
    handleChangeDefaultInformation,
    handleDeleteItem,
  } = props;

  const targetList = [
    { value: "An", label: "Đi ăn" },
    { value: "Di", label: "Đi chơi" },
    { value: "Owr", label: "Ở" },
  ];

  return (
    <div id={id} style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", width: "70%" }}>
        <TimePicker
          value={defaultFromTime}
          format={FORMAT_TIME}
          style={{ height: "2.5rem",width: "50%" }}
          onChange={(time) =>
            handleChangeDefaultInformation &&
            handleChangeDefaultInformation(
              "fromTime",
              time ? dayjs(time) : null
            )
          }
        />
        <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>~</span>
        <TimePicker
          value={defaultToTime}
          format={FORMAT_TIME}
          style={{ height: "2.5rem",width: "50%" }}
          onChange={(time) =>
            handleChangeDefaultInformation &&
            handleChangeDefaultInformation("toTime", time ? dayjs(time) : null)
          }
        />
      </div>
      <Select
        style={{marginLeft: "0.5rem", height: "2.5rem", width: handleDeleteItem ? "20%" : "30%" }}
        options={targetList}
        value={defaultTargetSelected}
        onChange={(value) =>
          handleChangeDefaultInformation &&
          handleChangeDefaultInformation("target", value)
        }
      />
      {handleDeleteItem ? (
        <Button
          type="primary"
          onClick={() => handleDeleteItem(id || "")}
          icon={<DeleteOutlined />}
          style={{
            alignSelf: "end",
            height: "2.5rem",
            marginLeft: "0.5rem",
            backgroundColor: "#F28076",
            padding: "0 1rem",
            borderColor: "#F28076",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            width : "10%"
          }}
        />
      ) : null }
    </div>
  );
}
