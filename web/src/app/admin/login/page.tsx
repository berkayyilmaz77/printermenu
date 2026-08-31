import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const raw = params.callbackUrl;
  const callbackUrl = typeof raw === "string" ? raw : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-muted">
          PRINTERMENU
        </p>
        <h1 className="mb-6 text-xl font-bold">Yönetici Girişi</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
