import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Syne } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
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

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F6FC" },
    { media: "(prefers-color-scheme: dark)", color: "#14141A" },
  ],
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
    "Next.js 15",
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
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${syne.variable}`}>
      <body className="font-sans antialiased selection:bg-[#374BFF] selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ScrollProgress />
          {children}
          <BackToTop />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1C1C26",
                color: "#F5F6FC",
                border: "1px solid rgba(55, 75, 255, 0.3)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
