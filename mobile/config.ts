// Web tarafındaki Next.js uygulamasının adresi. Geliştirirken aynı wifi'deki
// bilgisayarın IP'sini kullan (örn. "npm run dev" çalıştırdığında terminalde
// çıkan "Network:" adresi), canlıda Vercel'deki adresi yaz.
export const API_BASE_URL = "http://192.168.1.106:3000";

// /api/orders'ın istediği x-device-key. Web tarafındaki .env.local'de
// TABLET_API_KEY olarak duruyor, ikisi aynı olmalı.
export const DEVICE_KEY = "1Vv-lgfuwz-GSpopVxRpktNtUHg9tcLr";
