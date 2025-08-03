import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useState } from "react";
import { generateGemini } from "../api/geminiService";
import { geminiPromptTemplateUpdatePromptGenerateMac } from "../templates/geminiPromptTemplateUpdatePrompGenerateMax";
import { getDB } from "../utils/indexDB";

export interface ImageGeneratorProps {
  systemPrompt: string;
}

function ImageGenerator({ systemPrompt }: ImageGeneratorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    cleanupOldImages();
  }, []);

  const loadImageFromIndexedDB = async () => {
    const db = await getDB();
    const blob = await db.get("images", `images_mac_${today}`);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
      return url;
    }
  };

  const cleanupOldImages = async () => {
    const db = await getDB();
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    const keys = await store.getAllKeys();

    for (const key of keys) {
      if (!key.toString().includes(today)) {
        await store.delete(key);
      }
    }

    await tx.done;
  };

  const generateImage = async () => {
    setLoading(true);
    const isImageInIndexedDB = await loadImageFromIndexedDB();
    if (isImageInIndexedDB) {
      setLoading(false);
      return;
    }
    const cleanPrompt = systemPrompt
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .trim();

    const result = await generateGemini(
      geminiPromptTemplateUpdatePromptGenerateMac(cleanPrompt)
    );

    if (!result || !result.prompt) {
      alert("Failed to generate image prompt");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("prompt", result.prompt);
    formData.append("output_format", "webp");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_STABILITY_KEY}`,
          Accept: "image/*",
        },
        body: formData,
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const db = await getDB();
      await db.put("images", blob, `images_mac_${today}`);
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
        icon={!loading && <PlusOutlined />}
        style={{
          marginTop: "1rem",
          width: "100%",
          height: "2.5rem",
          backgroundColor: "#52c41a",
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
