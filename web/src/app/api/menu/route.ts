import { NextResponse } from "next/server";
import { getPublicMenu } from "@/lib/menu-data";

// Tablet uygulamasının menüyü çekmek için kullanacağı endpoint — /menu (QR
// sayfası) ile aynı kaynağı (getPublicMenu) kullanır, sadece JSON döner.
// Salt-okunur ve herkese açık (menü zaten /menu'de de public).
export const revalidate = 30;

export async function GET() {
  const categories = await getPublicMenu();
  return NextResponse.json(
    { categories },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
