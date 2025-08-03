
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const generateGemini = async (prompt: string) => {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    let content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) return null;

    content = content.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (err) {
      console.warn("⚠️ Không parse được JSON từ Gemini:", err);
      console.log('❓ Nội dung trả về:', content);
      return null;
    }
  } catch (err) {
    console.error('❌ Gemini API Error:', err);
    return null;
  }
};