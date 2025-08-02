import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";

export interface ImageGeneratorProps {
  systemPrompt: string;
}

function ImageGenerator(props: ImageGeneratorProps) {
  const { systemPrompt } = props;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    const formData = new FormData();
    const cleanPrompt = systemPrompt
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .trim();
    formData.append("prompt", cleanPrompt);
    formData.append("output_format", "webp");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_STABILITY_KEY}`, // ⚠️ Không nên để API key ở frontend thật
          Accept: "image/*",
        },
        body: formData,
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
    } else {
      const errorText = await response.text();
      console.error("Error:", response.status, errorText);
      alert("Image generation failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        type="primary"
        icon={loading ? null : <PlusOutlined />}
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
        loading={loading}
        onClick={generateImage}
      >
        {loading ? "Generating..." : "Generate Image"}
      </Button>
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Generated"
          style={{ marginTop: 20, maxWidth: "100%" }}
        />
      )}
    </div>
  );
}

export default ImageGenerator;
