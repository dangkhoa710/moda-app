import { getDistanceKm } from '../utils/location';

export interface LocationItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  note?: string;
  type?: string;
  distance?: number;
}

export const readAndSortLocationsByDistance = async (
  filePath: string,
  currentLat: number,
  currentLng: number,
  filterType?: string
): Promise<LocationItem[]> => {
  const url = `${filePath}?v=${Date.now()}`;
  const res = await fetch(url);
  const data = await res.arrayBuffer();
  const XLSX = await import('xlsx');
  const wb = XLSX.read(data);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet);

  const filtered = json.filter((item) => !filterType || item['Loại'] === filterType);

  const enriched = filtered.map((item) => ({
    id: item['ID'],
    name: item['Tên địa điểm'],
    lat: parseFloat(item['Lat']),
    lng: parseFloat(item['Lng']),
    address: item['Địa chỉ'],
    note: item['Ghi chú'],
    type: item['Loại'],
    distance: getDistanceKm(currentLat, currentLng, parseFloat(item['Lat']), parseFloat(item['Lng']))
  }));

  return enriched.sort((a, b) => a.distance! - b.distance!);
};

export const readLocationsFromGoogleSheet = async (
  sheetId: string,
  currentLat: number,
  currentLng: number,
  filterType?: string,
): Promise<LocationItem[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));

  const cols = json.table.cols.map((col: any) => col.label);
  const rows = json.table.rows;

  const items: LocationItem[] = rows.map((row: any) => {
    const obj: any = {};
    row.c.forEach((cell: any, i: number) => {
      obj[cols[i]] = cell?.v ?? '';
    });
  
    const lat = parseFloat(String(obj['Lat']).trim());
    const lng = parseFloat(String(obj['Lng']).trim());
  
    return {
      id: obj['ID'],
      name: obj['Tên địa điểm'],
      lat,
      lng,
      address: obj['Địa chỉ'],
      note: obj['Ghi chú'],
      type: obj['Loại'],
      distance: getDistanceKm(currentLat, currentLng, lat, lng),
    };
  });
  
  return (filterType ? items.filter((i) => i.type === filterType) : items).sort(
    (a, b) => a.distance! - b.distance!
  );
};

export const readLocationsFromGoogleSheetWithoutDistance = async (
  sheetId: string,
  filterType?: string,
): Promise<LocationItem[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));

  const cols = json.table.cols.map((col: any) => col.label);
  const rows = json.table.rows;

  const items: LocationItem[] = rows.map((row: any) => {
    const obj: any = {};
    row.c.forEach((cell: any, i: number) => {
      obj[cols[i]] = cell?.v ?? '';
    });

    const lat = parseFloat(String(obj['Lat']).trim());
    const lng = parseFloat(String(obj['Lng']).trim());

    return {
      id: obj['ID'],
      name: obj['Tên địa điểm'],
      lat,
      lng,
      address: obj['Địa chỉ'],
      note: obj['Ghi chú'],
      type: obj['Loại'],
    };
  });

  return filterType ? items.filter((i) => i.type === filterType) : items;
};
