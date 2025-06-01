import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "ERDエディタ",
  description: "データベースのER図を編集・管理するWebアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <Toaster position="top-center" />
        <Suspense fallback={<div className="bg-gray-800 h-16" />}>
          <NavBar />
        </Suspense>
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}