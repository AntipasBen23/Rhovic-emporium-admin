import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RHOVIC Admin Dashboard",
  description: "Marketplace OS for RHOVIC EMPORIUM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 text-gray-950">
        {children}
      </body>
    </html>
  );
}
