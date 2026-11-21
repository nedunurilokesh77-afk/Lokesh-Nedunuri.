import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { profile } from "@/data/portfolio";

const sora = Sora({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const manrope = Manrope({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const sameAs = [profile.github, profile.linkedin].filter((url) => /^https:\/\//.test(url));

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Lokesh Nedunuri | ECE Student at VIT-AP University",
    template: "%s | Lokesh Nedunuri",
  },
  description:
    "Official portfolio of Lokesh Nedunuri, an Electronics and Communication Engineering student at VIT-AP University, Andhra Pradesh. Explore his engineering interests, software projects, hackathon experience and experiments.",
  applicationName: "Lokesh Nedunuri — Engineering Portfolio",
  authors: [{ name: "Lokesh Nedunuri" }],
  creator: "Lokesh Nedunuri",
  publisher: "Lokesh Nedunuri",
  category: "technology",
  keywords: [
    "Lokesh Nedunuri",
    "Lokesh Nedunuri portfolio",
    "Lokesh Nedunuri VIT-AP",
    "Lokesh Nedunuri ECE",
    "Nedunuri",
    "Nedunuri engineer",
    "Electronics and Communication Engineering student",
    "VIT-AP University",
    "Megathon IIIT Hyderabad",
    "WebRTC projects",
    "embedded systems",
    "electronics projects",
  ],
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl || undefined,
    siteName: "Lokesh Nedunuri",
    title: "Lokesh Nedunuri | Electronics, Engineering & Technology",
    description:
      "Meet Lokesh Nedunuri — ECE student at VIT-AP University, exploring electronics, software, engineering projects and technology.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lokesh Nedunuri — Engineering the Possible" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokesh Nedunuri | ECE Student & Builder",
    description: "Electronics, engineering projects, software and experiments by Lokesh Nedunuri.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/logo.svg", shortcut: "/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#0b0a09", width: "device-width", initialScale: 1 };

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
    "@id": siteUrl ? `${siteUrl}/#lokesh-nedunuri` : undefined,
    name: "Lokesh Nedunuri",
    givenName: "Lokesh",
    familyName: "Nedunuri",
    description: "Electronics and Communication Engineering student at VIT-AP University in Andhra Pradesh, India, interested in electronics, software and engineering projects.",
    url: siteUrl,
    affiliation: { "@type": "CollegeOrUniversity", name: "VIT-AP University" },
    knowsAbout: ["Electronics and Communication Engineering", "Semiconductor devices", "Embedded systems", "Digital electronics", "Signals and systems", "Web development", "WebRTC", "Software prototyping"],
    ...(sameAs.length ? { sameAs } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${sora.variable} ${manrope.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
