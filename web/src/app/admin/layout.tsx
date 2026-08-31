import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/auth-actions";

// /admin/login kendi basit sayfası — bu layout'un nav'ını görmesin diye
// burada session'a bakıp login sayfasındaysak sade bir kabuk döndürüyoruz.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    // proxy.ts zaten /admin/login dışındaki her şeyi bu duruma düşmeden
    // yönlendirir; bu sadece savunma amaçlı ikinci bir katman.
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted">
              PRINTERMENU
            </p>
            <p className="text-sm font-semibold">Yönetim Paneli</p>
          </div>
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              href="/admin/categories"
              className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              Kategoriler
            </Link>
            <Link
              href="/admin/menu-items"
              className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              Ürünler
            </Link>
            <span className="mx-2 hidden text-xs text-muted sm:inline">
              {session.user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-border px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                Çıkış
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
