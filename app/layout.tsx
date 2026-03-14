import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/toast";
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
      <body className="antialiased">
        <ConvexClientProvider>
          {children}
          <Toaster richColors position="bottom-right" duration={3000} />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
