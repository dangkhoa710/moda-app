import { Timeline, Button, Image } from "antd";
import { TimeLineItem } from "./TimeLineItem";
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import daLatImage from "../assets/images/da_lat.png";
import { Schedules } from "./Schedules";

export interface InformationState {
  id?: string;
  fromTime: dayjs.Dayjs | null;
  toTime: dayjs.Dayjs | null;
  target: string | null;
  color: string;
}

export interface Schedule {
  fromTime: string;
  toTime: string;
  target: string;
  location_name: string;
  location_lat: string;
  location_lng: string;
  location_address: string;
  location_note: string;
}

export function TimeLineList() {
  const [informationItems, setInformationItems] = useState<InformationState[]>(
    []
  );
  const [defaultInformation, setDefaultInformation] =
    useState<InformationState>({
      id: undefined,
      fromTime: null,
      toTime: null,
      target: null,
      color: "",
    });

  const handleChangeDefaultInformation = (
    key: keyof InformationState,
    value: dayjs.Dayjs | null | string
  ) => {
    setDefaultInformation((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeItem = (
    id: string,
    key: keyof InformationState,
    value: dayjs.Dayjs | null | string
  ) => {
    setInformationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setInformationItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    if (
      !defaultInformation.fromTime ||
      !defaultInformation.toTime ||
      !defaultInformation.target
    ) {
      return;
    }
    setInformationItems([
      ...informationItems,
      {
        ...defaultInformation,
        id: uuidv4(),
        color: "#339AF0",
      },
    ]);
    setDefaultInformation({
      id: undefined,
      fromTime: null,
      toTime: null,
      target: null,
      color: "",
    });
  };

  const defaultItem = useMemo(
    () => [
      {
        children: (
          <div style={{ marginBottom: "1rem" }}>
            <TimeLineItem
              handleChangeDefaultInformation={handleChangeDefaultInformation}
              defaultFromTime={defaultInformation.fromTime}
              defaultToTime={defaultInformation.toTime}
              defaultTargetSelected={defaultInformation.target}
            />
          </div>
        ),
        dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
        color: "#339AF0",
      },
    ],
    [defaultInformation]
  );

  const items = useMemo(() => {
    return informationItems.map((item) => ({
      children: (
        <TimeLineItem
          id={item.id}
          defaultFromTime={item.fromTime}
          defaultToTime={item.toTime}
          defaultTargetSelected={item.target}
          handleDeleteItem={handleDeleteItem}
          handleChangeDefaultInformation={(key, value) =>
            handleChangeItem(item.id!, key as keyof InformationState, value)
          }
        />
      ),
      dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
      color: item.color,
    }));
  }, [informationItems]);
  const handleScheduleToday = () => {
    setSchedules([
      {
        fromTime: "07:00:00",
        toTime: "08:00:00",
        target: "An",
        location_name: "quan an",
        location_lat: "1094290434",
        location_lng: "1094290434",
        location_address: "1094290434",
        location_note: "~~~",
      },
      {
        fromTime: "08:00:00",
        toTime: "12:00:00",
        target: "Di",
        location_name: "quan an",
        location_lat: "1094290434",
        location_lng: "1094290434",
        location_address: "1094290434",
        location_note: "~~~",
      },
      {
        fromTime: "12:00:00",
        toTime: "13:00:00",
        target: "Owr",
        location_name: "quan an",
        location_lat: "1094290434",
        location_lng: "1094290434",
        location_address: "1094290434",
        location_note: "~~~",
      },
    ]);
  };

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const content = useMemo(() => {
    return schedules.length === 0 ? (
      <>
        <Timeline items={[...items, ...defaultItem]} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            marginTop: "1rem",
            alignSelf: "end",
            height: "2.5rem",
            backgroundColor: "#52c41a",
            padding: "0 1rem",
            borderColor: "#52c41a",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
          onClick={handleAddItem}
        >
          Thêm mới
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            marginTop: "1rem",
            alignSelf: "end",
            width: "100%",
            height: "2.5rem",
            backgroundColor: "#52c41a",
            padding: "0 1rem",
            borderColor: "#52c41a",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
          onClick={handleScheduleToday}
        >
          Nhận lịch trình hôm nay của bạn
        </Button>
      </>
    ) : (
      <Schedules schedules={schedules} />
    );
  }, [schedules]);

  return (
    <div style={{ maxWidth: "80%", padding: "1rem" }}>
      <div style={{ display: "flex", margin: "0 auto", maxWidth: "30.625rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ whiteSpace: "nowrap" }}>Lập kế hoạch du lịch Đà Lạt</h1>
          <span style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
            Hoạt động hằng ngày
          </span>
          {content}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: "3rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#f0f9f7",
              border: "1px solid #d9f7be",
              borderRadius: "1rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "1rem",
              maxWidth: "50rem",
              fontFamily: "Segoe UI, sans-serif",
              color: "#2f4f4f",
              lineHeight: 1.6,
            }}
          >
            <Image
              src={daLatImage}
              alt="Đà Lạt"
              style={{
                height: "12rem",
                width: "15rem",
                border: "2px solid #e0e0e0",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                objectFit: "cover",
              }}
            />
            <h2
              style={{
                color: "#1890ff",
                fontSize: "1.75rem",
                marginBottom: "1rem",
              }}
            >
              🏞️ Đà Lạt - Thành phố ngàn hoa
            </h2>
            <p style={{ fontSize: "1.1rem" }}>
              Đà Lạt, thành phố ngàn hoa, nổi tiếng với khí hậu se lạnh quanh
              năm, những con dốc lãng mạn, rừng thông bạt ngàn và kiến trúc cổ
              kính. Đây là điểm đến lý tưởng để thư giãn, khám phá thiên nhiên
              và tận hưởng vẻ đẹp bình yên giữa lòng cao nguyên Lâm Viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
