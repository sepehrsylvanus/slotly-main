// src/db/set-admin-password.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { user, account } from "./schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { hashPassword } from "better-auth/crypto";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  const email = "admin@artisanstudio.com";
  const password = "password123";

  console.log(`Setting up credentials for ${email}...`);
  const hashedPassword = await hashPassword(password);

  const existingUsers = await db
    .select()
    .from(user)
    .where(eq(user.email, email));

  let userId: string;
  if (existingUsers.length === 0) {
    userId = "admin_001";
    await db.insert(user).values({
      id: userId,
      name: "Studio Admin",
      email,
      emailVerified: true,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    userId = existingUsers[0].id;
    await db
      .update(user)
      .set({ role: "ADMIN", emailVerified: true })
      .where(eq(user.id, userId));
  }

  const existingAccounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));

  if (existingAccounts.length === 0) {
    await db.insert(account).values({
      id: nanoid(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.userId, userId));
  }

  console.log("✅ Credentials updated successfully!");
  console.log(`Email: ${email} | Password: ${password}`);

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
