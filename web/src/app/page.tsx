import { redirect } from "next/navigation";

// Bu proje kapsamında ana domain doğrudan QR menüye açılıyor — ayrı bir
// pazarlama/karşılama sayfası yok. Sipariş verme ve yazıcı entegrasyonu
// mobil uygulamada, admin yönetimi /admin altında.
export default function RootPage() {
  redirect("/menu");
}
