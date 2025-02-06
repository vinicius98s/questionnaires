import { cookies } from "next/headers";

import { users } from "./db/schema";

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return Number(session) as number;
}

export async function createSession(user: typeof users.$inferSelect) {
  console.log(user);
  (await cookies()).set("session", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
