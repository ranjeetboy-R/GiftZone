import { Commissioner, Felipa, Story_Script } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import AppProviders from '@/context/AppProviders';

const commissioner = Commissioner({
  variable: "--font-commissioner",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800']
});

const storyScript = Story_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});


export const metadata = {
    title: 'Gift Zone | Gifts for Every Moment',
    description: 'Thoughtful gifts for birthdays, anniversaries, weddings, festivals and every special moment.',
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${commissioner.variable} ${storyScript.variable}`}>
                    <AppProviders>
                        {children}
                    </AppProviders>
                </body>
            </html>
        </ClerkProvider>
    );
}
