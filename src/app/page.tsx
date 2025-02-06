import { eq } from "drizzle-orm";

import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession } from "@/lib/auth";

export type LoginResponse = {
  error: string | null;
  user: {
    isAdmin: boolean;
  } | null;
};

export default function Login() {
  const onLogin = async (
    username?: string,
    password?: string
  ): Promise<LoginResponse> => {
    "use server";

    if (username && password) {
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (user && user.password !== password) {
        return { error: "Bad password", user: null };
      }

      if (!user) {
        const [result] = await db
          .insert(users)
          .values({ username, password })
          .returning();
        user = result;
      }

      await createSession(user);
      return { error: null, user: { isAdmin: user?.role === "admin" } };
    }

    return { error: "Something went wrong", user: null };
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="w-[350px] h-fit">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onLogin={onLogin} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" form="login-form">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
