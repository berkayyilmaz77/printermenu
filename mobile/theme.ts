// Tasarım tokenleri — web tarafındaki globals.css'teki renklerle birebir aynı,
// tek marka iki yüzde tutarlı görünsün diye. Renk değiştirmek gerekirse
// ikisini birlikte güncelle (web: web/src/app/globals.css).
export const colors = {
  background: "#f7f6f3",
  surface: "#ffffff",
  surface2: "#efece6",
  foreground: "#1c1b18",
  muted: "#757066",
  border: "#e4e0d8",
  accent: "#d9484d",
  accentSoft: "rgba(217, 72, 77, 0.12)",
  success: "#1a9c63",
  successSoft: "rgba(26, 156, 99, 0.12)",
  pillActiveBg: "#1c1b18",
  pillActiveFg: "#f7f6f3",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: "700" as const, letterSpacing: 2 },
  heading: { fontSize: 18, fontWeight: "700" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  caption: { fontSize: 12, fontWeight: "500" as const },
};

// Kartlara hafif derinlik veren gölge — hem iOS hem Android'de çalışır.
// Açık temada koyu temaya göre daha silik tutuluyor (aksi halde sert görünür).
export const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
};

// Ekranların arka planında düz tek renk yerine hafif bir sıcaklık — web'deki
// globals.css'teki radial-gradient'in RN karşılığı (LinearGradient sadece
// doğrusal destekliyor ama benzer bir "üstte hafif parıltı" hissi veriyor).
export const backgroundGradient: [string, string] = ["#fbf3f2", colors.background];
