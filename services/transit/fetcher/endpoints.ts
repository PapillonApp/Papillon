const BGTFS_BASE_URL = 'https://bgtfs.transitapp.com/v3/public';
const API_BASE_URL = "https://transitapp.com/en/trip/api";

export const BGTFS_PLAN = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  mode: string,
  considerDowntimes: boolean,
  locale: string
) =>
  `${BGTFS_BASE_URL}/plan?from_lat=${fromLat}&from_lon=${fromLon}&to_lat=${toLat}&to_lon=${toLon}&mode=${mode}&consider_downtimes=${considerDowntimes}&locale=${locale}`;

export const TRIP_SUGGESTION = (lat: number, lng: number, query: string) =>
  `${API_BASE_URL}/suggestions?lat=${lat}&lng=${lng}&search-term=${query}`;
