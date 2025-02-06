"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton(props: { onLogout: () => Promise<void> }) {
  const pathname = usePathname();
  if (pathname !== "/") {
    return (
      <Button
        onClick={props.onLogout}
        variant="secondary"
        className="absolute top-2 right-2"
      >
        <LogOut />
        Logout
      </Button>
    );
  }

  return null;
}
