import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { LayoutWrapper } from '@/components/LayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SyncCRM - Music Production',
  description: 'A modern, responsive CRM for music producers with WhatsApp/n8n and Supabase integration.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <body className="bg-bg-main text-slate-100 font-sans min-h-screen" suppressHydrationWarning>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#0D0D0F',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }
        }}/>
      </body>
    </html>
  );
}
