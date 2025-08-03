import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getFieldFromStorage, getUserData } from "../utils/localStorage";
import { useEffect, useMemo, useState } from "react";
import { generateGemini } from "../api/geminiService";
import { geminiPromptTemplateMac } from "../templates/geminiPromptTemplateMac";
import ImageGenerator from "../components/AsyncImageGenerator";

const { Title } = Typography;

export default function Mac() {
  const navigate = useNavigate();
  const user = getUserData();

  const [loading, setLoading] = useState(true);
  const [outfit, setOutfit] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prompt = geminiPromptTemplateMac({
          gender: getFieldFromStorage("moda_user_info", "gender") ?? "",
          birthdate: getFieldFromStorage("moda_user_info", "dob") ?? "",
          mbti: getFieldFromStorage("moda_user_info", "mbti") ?? "",
          temperature:
            getFieldFromStorage(
              "moda_weather_data",
              "data.weather.main.temp"
            ) ?? "",
          weather:
            getFieldFromStorage(
              "moda_weather_data",
              "data.weather.weather.0.description"
            ) ?? "",
        });

        const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        const cacheKey = `moda_user_outfit_${today}`;
        let suggestion: any = null;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          try {
            suggestion = JSON.parse(cached);
          } catch {
            localStorage.removeItem(cacheKey);
          }
        }
        if (!suggestion) {
          const result = await generateGemini(prompt);
          if (result) {
            suggestion = result;
            localStorage.setItem(cacheKey, JSON.stringify(result));
          }
        }

        if (suggestion) {
          setOutfit(suggestion);
        } else {
          console.warn("Không có gợi ý hợp lệ.");
        }
      } catch (err) {
        console.error("❌ Lỗi :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const prompt = useMemo(
    () => [
      `Design an outfit that incorporates exactly the colors ${outfit?.colors.join(
        ", "
      )} in the clothing items.`,
      `User  go on a vacation to ${getFieldFromStorage(
        "moda_weather_data",
        "data.city"
      )}`,
      `User have gender ${getFieldFromStorage("moda_user_info", "gender")} `,
      `and birth date ${getFieldFromStorage("moda_user_info", "dob")} `,
      `the weather is ${getFieldFromStorage(
        "moda_weather_data",
        "data.weather.weather.0.description"
      )} `,
      `and temperature is ${getFieldFromStorage(
        "moda_weather_data",
        "data.weather.main.temp"
      )}°C`,
      `${outfit?.outfit_en}.`,
      `Make sure the specified colors are clearly present in the sweater, jacket, or pants.`,
    ],
    [outfit]
  )
    .filter(Boolean) // Loại bỏ null hoặc undefined
    .join(", ");
  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => navigate("/menu")} style={{ marginBottom: 16 }}>
        ← Quay lại
      </Button>
      <Title level={3}>
        Trang phục gợi ý cho {user.name} ({user.mbti})
      </Title>
      <h2>Thời tiết:</h2>{" "}
      <h2>
        {getFieldFromStorage(
          "moda_weather_data",
          "data.weather.weather.0.description"
        )}{" "}
        - {getFieldFromStorage("moda_weather_data", "data.weather.main.temp")}°C
      </h2>
      {loading ? (
        <p>Đang lấy gợi ý ...</p>
      ) : (
        outfit && (
          <Card
            title="Màu sắc tổng thể"
            style={{ maxWidth: 600, marginTop: 24, borderRadius: 8 }}
          >
            {Array.isArray(outfit?.colors) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: 180,
                  overflow: "hidden",
                  marginBottom: 16,
                  gap: 8,
                }}
              >
                {outfit.colors.map((color: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      width: "50%",
                      height: 60,
                      backgroundColor: color,
                      border: "2px solid #666",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </div>
            )}
            <h2>
              <strong>Gợi ý:</strong> {outfit.outfit}
            </h2>
            {outfit.accessories && (
              <p>
                <strong>Phụ kiện:</strong> {outfit.accessories}
              </p>
            )}
            {outfit.note && (
              <p>
                <em>{outfit.note}</em>
              </p>
            )}
            <ImageGenerator systemPrompt={prompt} />
          </Card>
        )
      )}
    </div>
  );
}
