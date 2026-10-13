import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "../sessionProvider";
import SessionProviderwholefolder from "../sessionProvider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/hooks/initUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1o minutes grocery Delivery app ",
  description: "1o minutes grocery Delivery app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-100 to-white">
        <SessionProviderwholefolder><StoreProvider><InitUser />{children}</StoreProvider></SessionProviderwholefolder></body>
    </html >
  );
}
