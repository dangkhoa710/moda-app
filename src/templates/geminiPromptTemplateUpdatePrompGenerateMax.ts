export const geminiPromptTemplateUpdatePromptGenerateMac =(prompt:string)=>{
  return `You are a professional prompt engineer for an AI image generation model (Stability AI). Your task is to create a short, clear system prompt that precisely describes the image to be generated based on the user input.
Requirements:
- Use detailed, specific visual language (following Midjourney / Stable Diffusion style).
- Do not use vague adjectives like “beautiful,” “nice,” or “good.”
- Output must be one single prompt sentence only, with no explanations.
- Force the "prompt" has to be exactly colors for clothing items and give exactly color(HEX color).
- Input: ${prompt}
- Now return a refined and stable prompt ready to be used in Stability AI. Output is a JSON object with a single key "prompt" containing the generated prompt.`;
} 