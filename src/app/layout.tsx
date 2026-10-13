import { Suspense } from "react";
import { StoreProvider } from "@/redux/store/StoreProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { FcmProvider } from "@/providers/FcmProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Candal, Nunito } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import InspectElement from "@/components/common/PreventInspectElement";
import LangGate from "@/components/common/LangGate";
import { AdZoneProvider } from "@/components/ads/AdZone";
import { isAdsEnabled, ADSENSE_SCRIPT_SRC } from "@/lib/ads-config";
import "katex/dist/katex.min.css";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const candal = Candal({
  variable: "--font-candal",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Elite Quiz",
  description: "Elite Quiz Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${candal.variable} ${nunito.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="pointer-events-auto!">
        <InspectElement>
          <StoreProvider>
            <QueryProvider>
              <Suspense fallback={null}>
                <LangGate />
              </Suspense>
              <FcmProvider />
              {isAdsEnabled() && (
                <Script id="adsbygoogle-loader" async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" strategy="afterInteractive" />
              )}
              <Suspense fallback={null}>
                <AdZoneProvider>{children}</AdZoneProvider>
              </Suspense>
              <Toaster position="top-right" />
            </QueryProvider>
          </StoreProvider>
        </InspectElement>
      </body>
    </html>
  );
}
