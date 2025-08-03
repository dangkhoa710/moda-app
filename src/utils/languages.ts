export function cleanCityName(city: string): string {
  return city
    .replace(/^TP\.\s*/i, "")
    .replace(/^Thành phố\s+/i, "")
    .replace(/^Tinh\s+/i, "")
    .trim();
}
