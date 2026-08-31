"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    // signIn başarılı olduğunda Next.js'in redirect mekanizması bir hata
    // fırlatır (NEXT_REDIRECT) — bunu olduğu gibi yeniden fırlatmalıyız,
    // yoksa yönlendirme gerçekleşmez. Sadece gerçek kimlik doğrulama
    // hatalarını burada yakalayıp forma geri döndürüyoruz.
    if (error instanceof AuthError) {
      return { error: "E-posta veya şifre hatalı." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
