import { Geist, Geist_Mono } from "next/font/google"; //Importing fonts
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventUpdateNotification from '@/components/EventUpdateNotification';
import CohostInvitationNotification from '@/components/CohostInvitationNotification';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rice Parties",
  description: "Discover and organize campus events at Rice University",
  metadataBase: new URL('https://riceparties.com'),
  openGraph: {
    title: "Rice Parties - Find Campus Events",
    description: "Find parties, pregames, and events happening at Rice University",
    url: 'https://riceparties.com',
    siteName: 'Rice Parties',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Rice Parties - Campus Events',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Rice Parties - Find Campus Events",
    description: "Find parties, pregames, and events happening at Rice University",
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <EventUpdateNotification />
        <CohostInvitationNotification />
        <ToastContainer />
      </body>
    </html>
  );
}
