// Kullanım: node --env-file=.env.local scripts/create-admin.mjs <email> <şifre>
// İlk admin kullanıcısını (veya şifre sıfırlamak için mevcut birini) oluşturur.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Kullanım: node --env-file=.env.local scripts/create-admin.mjs <email> <şifre>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 10);

await sql`
  insert into admin_users (email, password_hash, role)
  values (${email.toLowerCase().trim()}, ${passwordHash}, 'owner')
  on conflict (email) do update set password_hash = excluded.password_hash
`;

console.log(`Admin kullanıcı hazır: ${email}`);
