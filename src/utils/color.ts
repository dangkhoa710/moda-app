import { DOT_COLORS } from "../constants/Suggestion";

export function getRandomDotColor() {
  const index = Math.floor(Math.random() * DOT_COLORS.length);
  return DOT_COLORS[index];
}