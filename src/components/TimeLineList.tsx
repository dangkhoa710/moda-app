import { Timeline, Button, Image } from "antd";
import { TimeLineItem } from "./TimeLineItem";
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import daLatImage from "../assets/images/da_lat.png";
import { Schedules } from "./Schedules";
import {useNavigate} from "react-router-dom";
import {LocationItem, readLocationsFromGoogleSheetWithoutDistance} from "../services/locationService";
import {getCurrentPosition } from "../utils/geo";
import { getNearestLocation } from '../utils/location';
import { useEffect } from "react";
import {getFieldFromStorage} from "../utils/localStorage";

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
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const navigate = useNavigate();
  const [informationItems, setInformationItems] = useState<InformationState[]>(
    []
  );

  useEffect(() => {
    const cached = localStorage.getItem("moda_schedule");
    if (cached) {
      const schedules: Schedule[] = JSON.parse(cached);
      const converted = schedules.map((s) => ({
        id: uuidv4(),
        fromTime: dayjs(s.fromTime, "HH:mm:ss"),
        toTime: dayjs(s.toTime, "HH:mm:ss"),
        target: s.target,
        color: "#339AF0",
      }));
      setInformationItems(converted);
    }
  }, []);


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
        color: "#4EB09B",
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
  const handleScheduleToday = async () => {
    try {
      setLoadingSchedule(true);
      const currentLocation = await getCurrentPosition();

      const allItems = [...informationItems];
      if (
        defaultInformation.fromTime &&
        defaultInformation.toTime &&
        defaultInformation.target
      ) {
        allItems.push({
          ...defaultInformation,
          id: "default-temporary",
          color: "#339AF0",
        });
      }

      const scheduleInput = allItems.map((item) => ({
        fromTime: item.fromTime?.format("HH:mm:ss") || "",
        toTime: item.toTime?.format("HH:mm:ss") || "",
        target: item.target || "",
      }));


      const updatedSchedule: Schedule[] = [];
      let currentPos = currentLocation;
      const usedLocations: Set<string> = new Set();

      for (const item of scheduleInput) {
        if (item.target === "Off") {
          updatedSchedule.push({
            ...item,
            location_name: "Nghỉ ngơi",
            location_lat: "",
            location_lng: "",
            location_address: "",
            location_note: "Thời gian thư giãn, nghỉ ngơi.",
          });
          continue;
        }

        let matchedLocation: LocationItem | null = null;
        let locationList: LocationItem[] = [];

        if (item.target === 'An') {
          locationList = await readLocationsFromGoogleSheetWithoutDistance(
            process.env.REACT_APP_GOOGLE_SHEET_ID!,
            'Ăn'
          );
        } else if (item.target === 'Di') {
          locationList = await readLocationsFromGoogleSheetWithoutDistance(
            process.env.REACT_APP_GOOGLE_SHEET_ID!,
            'Đi'
          );
        }

        const filtered = locationList.filter(
          (loc) => !usedLocations.has(loc.name)
        );

        matchedLocation = getNearestLocation(currentPos, filtered);

        if (matchedLocation) {
          usedLocations.add(matchedLocation.name);
          currentPos = {
            lat: matchedLocation.lat,
            lng: matchedLocation.lng,
          };
        }

        updatedSchedule.push({
          ...item,
          location_name: matchedLocation?.name || '',
          location_lat: String(matchedLocation?.lat || ''),
          location_lng: String(matchedLocation?.lng || ''),
          location_address: matchedLocation?.address || '',
          location_note: matchedLocation?.note || '',
        });
      }

      setSchedules(updatedSchedule);
      const SCHEDULE_KEY = "moda_schedule";
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(updatedSchedule));
      navigate("/schedules");

    } catch (err) {
      console.error("Không thể tạo lịch trình:", err);
    } finally {
      setLoadingSchedule(false);
    }
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
            backgroundColor: "#4EB09B",
            padding: "0 1rem",
            borderColor: "#4EB09B",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
          onClick={handleAddItem}
        >
          Thêm mốc thời gian
        </Button>
        <Button
          type="primary"
          loading={loadingSchedule}
          style={{
            marginTop: "1rem",
            alignSelf: "end",
            width: "100%",
            height: "2.5rem",
            backgroundColor: "#368070",
            padding: "0 1rem",
            borderColor: "#368070",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
          onClick={handleScheduleToday}
        >
          Nhận lịch trình hôm nay của bạn
        </Button>
      </>
    ) : (
      <>
        <div style={{textAlign: "right", marginBottom: 16}}>
          <Button style={{ backgroundColor: "#2d6a5c" , color:"#fff", borderColor: "#2d6a5c", fontWeight:"bold", marginRight: "0.5rem" }} onClick={() => setSchedules([])}>
            ✏️ Quay lại chỉnh sửa
          </Button>
          <Button
            style={{ backgroundColor: "#F28076" , color:"#fff", borderColor: "#F28076", fontWeight:"bold"}}
            onClick={() => {
              localStorage.removeItem("moda_schedule");
              setSchedules([]);
              setInformationItems([]);
            }}
          >
            🗑 Xoá lịch trình
          </Button>
        </div>
        <Schedules schedules={schedules}/>
      </>
    );
  }, [schedules, items, defaultItem]);

  return (
    <div className="timeline-page">
      <div className="main-container">
        <div className="left-section">
          <div style={{ marginBottom: "1rem", width: "100%" }}>
            <Button onClick={() => navigate('/menu')} style={{ marginBottom: 16 }}>
              ← Quay lại
            </Button>
          </div>
          <h1 style={{ whiteSpace: "nowrap" }}>Lập kế hoạch du lịch {getFieldFromStorage("moda_weather_data", "data.city")}</h1>
          <span style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
          Thời gian hoạt động
        </span>
          {content}
        </div>
        <div className="right-section">
          <div
            style={{
              backgroundColor: "#ffefdf",
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
                width: "100%",
                maxWidth: "15rem",
                border: "2px solid #e0e0e0",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                objectFit: "cover",
              }}
            />
            <h2
              style={{
                color: "#4EB09B",
                marginBottom: "1rem",
                fontWeight: 'bold'
              }}
            >
              🏞️ Đà Lạt
              <br />
              Thành phố ngàn hoa
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
