export const CITIES = [
  'Addis Ababa',
  'Hawassa',
  'Adama',
  'Dire Dawa',
  'Bahir Dar',
  'Bishoftu',
  'Mekelle',
];

export const CITY_NEIGHBORHOODS_MAP: Record<string, string[]> = {
  'Addis Ababa': [
    'Bole',
    'Kazanchis',
    'Piassa',
    'CMC',
    'Yeka',
    'Arada',
    'Kirkos',
    'Nifas Silk',
    'Akaki Kality',
    'Gullele',
    'Lideta',
    'Kolfe Keraniyo',
  ],
  Hawassa: ['Piazza', 'Haile Resort Area', 'Tula', 'Menhariya', 'Tabor', 'Gebeya', 'Bruk'],
  Adama: ['Posta Bet', 'Bole Adama', 'Mebrat Hayl', 'Luganta', 'Guto', 'Kebele 01'],
  'Dire Dawa': ['Kezira', 'Megala', 'Sabian', 'Taiwan', 'Ashawa'],
  'Bahir Dar': ['Kebele 04', 'Poly', 'Belay Zeleke', 'Gish Abay', 'Tana'],
  Bishoftu: ['Bole Bishoftu', 'Lakeside', 'Babogaya', 'Gora'],
  Mekelle: ['Kedamay Weyane', 'Hadnet', 'Hawelti', 'Ayder', 'Semien'],
};

export function getNeighborhoodsForCity(city?: string): string[] {
  if (!city || city.trim() === '') {
    // Combine all unique neighborhoods
    const all = Object.values(CITY_NEIGHBORHOODS_MAP).flat();
    return Array.from(new Set(all));
  }

  const matchedKey = Object.keys(CITY_NEIGHBORHOODS_MAP).find(
    (k) => k.toLowerCase() === city.trim().toLowerCase(),
  );

  if (matchedKey && CITY_NEIGHBORHOODS_MAP[matchedKey]) {
    return CITY_NEIGHBORHOODS_MAP[matchedKey];
  }

  return ['Central Area', 'Downtown', 'Suburbs'];
}
