import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { BackToTop } from "@/components/shared/back-to-top";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/data/site-content";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F5F6FC",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || siteConfig.url),
  title: {
    default: "TrioCore — Think. Build. Scale. | Building Digital Essence",
    template: "%s | TrioCore",
  },
  description: siteConfig.description,
  keywords: [
    "TrioCore",
    "Digital Solutions India",
    "Web Development India",
    "Affordable Website Development",
    "Next.js",
    "NFC Business Cards",
    "Restaurant QR Menu System",
    "Machine Learning",
    "Robotics",
    "Kolkata",
    "Krishnendu Adak",
    "Nandita Ghosh",
    "Chandrima Chowdhury",
  ],
  authors: [
    { name: "Krishnendu Adak" },
    { name: "Nandita Ghosh" },
    { name: "Chandrima Chowdhury" },
  ],
  creator: "TrioCore",
  publisher: "TrioCore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: "TrioCore — Think. Build. Scale. | Building Digital Essence",
    description: siteConfig.description,
    siteName: "TrioCore",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrioCore — Think. Build. Scale.",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light scroll-smooth ${spaceGrotesk.variable} ${inter.variable}`}
      style={{ colorScheme: "light" }}
    >
      <body className="font-sans antialiased bg-[#F5F6FC] text-[#14141A] selection:bg-[#374BFF] selection:text-white min-h-screen">
        <ScrollProgress />
        {children}
        <BackToTop />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#14141A",
              border: "1px solid rgba(20, 20, 26, 0.14)",
              boxShadow: "0 8px 30px -4px rgba(20, 20, 26, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
