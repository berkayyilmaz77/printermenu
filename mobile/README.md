# PrinterMenu — Tablet sipariş uygulaması

Dükkandaki tabletten menüye bakıp sipariş vermek için. Web tarafındaki (`../web`)
`/api/menu` ve `/api/orders` endpoint'lerini kullanıyor.

## Çalıştırma

```bash
npm install
npx expo start
```

Telefonda/tablette **Expo Go** uygulamasıyla çıkan QR kodu okutarak açabilirsin
(hızlı test için). Gerçek kullanım için standalone APK basılması gerekecek
(`npx expo run:android` veya EAS Build).

`config.ts` içinde `API_BASE_URL`'i kendi bilgisayarının IP'sine (aynı wifi'de
test ederken) veya canlıdaki Vercel adresine göre güncelle.

## Eksik: yazıcı entegrasyonu

Sipariş `/api/orders`'a gönderiliyor ve web tarafında `print_jobs` tablosuna
`pending` durumunda bir kayıt düşüyor ama fiziksel yazıcıya gönderme kısmı
henüz yok — hangi yazıcı (Bluetooth/USB/ağ, ESC/POS mü) kullanılacağı belli
olunca eklenecek.
