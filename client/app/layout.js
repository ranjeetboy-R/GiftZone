import { Commissioner, Felipa, Story_Script } from "next/font/google";
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
  title: 'Gift Zone | Shop Everything You Need',
  description: 'Discover quality products across everyday categories at one convenient store.'
};

export default function RootLayout({ children }) {
  return <ClerkProvider>
    <html lang="en">
      <body className={`${commissioner.variable} ${storyScript.variable}`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  </ClerkProvider>;
}
