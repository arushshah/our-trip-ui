const apiUrl = import.meta.env.VITE_API_URL;
const mapsKey = import.meta.env.VITE_MAPS_API_KEY;

if (!apiUrl) {
  throw new Error('API URL is not defined');
}
if (!mapsKey) {
    throw new Error('Maps API Key is not defined');
  }

export { apiUrl, mapsKey };