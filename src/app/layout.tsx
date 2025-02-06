import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import "./globals.css";
import { LogoutButton } from "@/components/logout-button";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const onLogout = async () => {
    "use server";
    (await cookies()).delete("session");
    redirect("/");
  };

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <LogoutButton onLogout={onLogout} />
        {children}
      </body>
    </html>
  );
}
