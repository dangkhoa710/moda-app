interface GeminiPromptOptions {
  gender: string;
  birthdate: string;
  mbti: string;
  temperature: number;
  weather: string;
}

export const geminiPromptTemplateMac = (options: {
  gender: string | null;
  birthdate: string | null;
  mbti: string | null;
  temperature: number;
  weather: string;
}): string => {
  const {
    gender,
    birthdate,
    mbti,
    temperature,
    weather,
  } = options;


  return `Bạn là một trợ lý thời trang thông minh.\\nHãy dựa vào MBTI, ngày sinh, giới tính, nhiệt độ và thời tiết để gợi ý một outfit đi chơi phù hợp.\\nTrả kết quả bằng tiếng Việt, dưới dạng JSON gồm:\\n- 'outfit': mô tả ngắn gọn trang phục phù hợp (tối đa 2 dòng)\\n- 'colors': mảng gồm 3 màu sắc phù hợp với trang phục (ghi bằng mã HEX)\\nVí dụ:\\n{\\n'outfit': 'Áo thun trắng kết hợp với chân váy chữ A màu pastel và giày sneaker. Thêm áo khoác mỏng nếu ra ngoài buổi tối.',\\n'colors': ['#FFDAB9',...]\\n}\\n và thêm các trường json với phiên bản tiếng anh json  'outfit_en': Brief description of suitable outfit (maximum 2 lines)\\n'outfit_en': 'White T-shirt with pastel A-line skirt and sneakers. Add a light jacket if going out at night.'Dữ liệu đầu vào:\\nMBTI: ${mbti}\\nNgày sinh: ${birthdate}\\nGiới tính: ${gender}\\nNhiệt độ: ${temperature}°C\\nThời tiết:${weather}`;
};