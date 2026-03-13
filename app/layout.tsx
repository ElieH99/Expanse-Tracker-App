import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal Expense Tracker",
  description: "Submit and manage expense claims for approval",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
