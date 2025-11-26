import type { Metadata } from 'next';
import { Germania_One } from 'next/font/google';
import './globals.css';

const germaniaOne = Germania_One({
  weight: '400',
  variable: '--font-germania-one',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dyke Night Boston',
  description: 'Dyke Night Boston - Cruising for a Cause',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${germaniaOne.variable} antialiased`}>{children}</body>
    </html>
  );
}
