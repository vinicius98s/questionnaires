"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { LoginResponse } from "@/app/page";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onLogin: (username?: string, password?: string) => Promise<LoginResponse>;
};

export function LoginForm(props: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, formAction] = useActionState(
    async (_: string | null, formData: FormData) => {
      const username = formData.get("username")?.toString();
      const password = formData.get("password")?.toString();
      const response = await props.onLogin(username, password);
      if (response.user) {
        router.push(response.user.isAdmin ? "/admin" : "/home");
      }

      return response.error;
    },
    null
  );

  return (
    <>
      <form action={formAction} id="login-form">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              required
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
        </div>
      </form>

      {message ? <p className="text-destructive mt-3">{message}</p> : null}
    </>
  );
}
