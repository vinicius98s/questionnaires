import { cookies } from "next/headers";

import { users } from "./db/schema";

type Session = {
  userId: string;
  isAdmin: boolean;
};

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return JSON.parse(session) as Session;
}

export async function createSession(user: typeof users.$inferSelect) {
  const sessionData: Session = {
    userId: user.id.toString(),
    isAdmin: user.role === "admin",
  };

  (await cookies()).set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
