import { Commissioner, Story_Script } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import AppProviders from '@/context/AppProviders';
import { Toaster } from "react-hot-toast";

const commissioner = Commissioner({
  variable: "--font-commissioner",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800']
});

const storyScript = Story_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400"
});

export const metadata = {
  metadataBase: new URL("https://giftzoneselling.vercel.app"),

  title: {
    default: "Gift Zone | Shop Everything You Need",
    template: "%s | Gift Zone"
  },

  description:
    "Discover quality products across everyday categories at Gift Zone. Shop electronics, fashion, home & living, beauty, personalized gifts and more.",

  keywords: [
    "Gift Zone",
    "online shopping",
    "online store",
    "gifts",
    "electronics",
    "fashion",
    "home and living",
    "beauty",
    "personalized gifts",
    "birthday gifts",
    "anniversary gifts",
    "wedding gifts"
  ],

  authors: [
    {
      name: "Gift Zone"
    }
  ],

  creator: "Gift Zone",
  publisher: "Gift Zone",

  applicationName: "Gift Zone",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },

  alternates: {
    canonical: "/"
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Gift Zone",
    title: "Gift Zone | Shop Everything You Need",
    description:
      "Discover quality products across everyday categories at Gift Zone."
  },

  twitter: {
    card: "summary",
    title: "Gift Zone | Shop Everything You Need",
    description:
      "Discover quality products across everyday categories at Gift Zone."
  },

  category: "shopping"
};

export default function RootLayout({ children }) {
  return <ClerkProvider>
    <html lang="en">
      <body className={`${commissioner.className} ${storyScript.variable}`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  </ClerkProvider>;
}
