import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodBridge - Connect. Donate. Impact.",
  description:
    "FoodBridge connects food donors, NGOs, and volunteers to reduce food waste and help those in need. Join our mission for a hunger-free world.",
  keywords: "food donation, NGO, volunteers, food waste, social welfare, FoodBridge",
  openGraph: {
    title: "FoodBridge - Connect. Donate. Impact.",
    description: "Bridging the gap between food surplus and food scarcity.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: "var(--border)", color: "var(--text-primary)", borderRadius: "12px", border: "1px solid #334155" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
