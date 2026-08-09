import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ReMarket | Used Goods Marketplace Ethiopia',
  description: 'Buy and sell quality used electronics, furniture, vehicles, and apparel locally.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}