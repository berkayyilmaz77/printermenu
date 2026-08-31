# PrinterMenu — QR menü + yönetim paneli

Restoran/kafe için QR ile açılan dijital menü ve bu menüyü yöneten admin paneli. Sipariş
verme ve yazıcı entegrasyonu bu depoda değil, ayrı bir mobil/tablet uygulamasında.

## Kurulum

```bash
npm install
```

`.env.local` içinde şunlar tanımlı olmalı (Vercel ile bağlıysa `vercel env pull` ile çekilir):

- `DATABASE_URL` — Neon Postgres bağlantısı
- `BLOB_READ_WRITE_TOKEN` — ürün görselleri için Vercel Blob
- `AUTH_SECRET` — next-auth JWT imzalama anahtarı (`openssl rand -base64 32` ile üretilir).
  Prod'a deploy edilecekse Vercel proje ayarlarına da eklenmeli.

Şema zaten Neon DB'ye push edilmiş durumda (bkz. `src/db/schema.ts`). Şemada değişiklik
yaparsan `npx drizzle-kit push` ile senkronize et.

### İlk admin kullanıcısını oluşturma

```bash
node --env-file=.env.local scripts/create-admin.mjs <email> <şifre>
```

Aynı email ile tekrar çalıştırırsan şifreyi günceller.

```bash
npm run dev
```

## Yapı

- `/menu` — herkese açık, salt-okunur QR menü (TR/EN)
- `/admin` — kategori/ürün/ayar yönetimi, next-auth ile korunuyor
- `src/db/schema.ts` — Drizzle şeması (Postgres/Neon)
- `src/lib/menu-data.ts` — public menü verisi (`/menu` bu fonksiyonu kullanır)
- `src/lib/admin-data.ts` / `admin-actions.ts` — admin paneli okuma/yazma
