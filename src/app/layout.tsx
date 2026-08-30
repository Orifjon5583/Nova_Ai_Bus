import type { Metadata } from 'next';
import './globals.css';
import { SystemProvider } from '../lib/store';
import Navbar from '../components/layout/Navbar';
import ClientOnly from '../components/common/ClientOnly';

export const metadata: Metadata = {
  title: 'Nova Maktab Bus - Transport Boshqaruv Tizimi',
  description: 'Xususiy maktab o\'quvchilarini maktabga va uyiga xavfsiz yetkazish intellektual tizimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full bg-slate-950 text-slate-100" suppressHydrationWarning>
      <body 
        className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white"
        suppressHydrationWarning
      >
        <SystemProvider>
          <ClientOnly>
            <div className="min-h-screen flex flex-col" suppressHydrationWarning>
              <Navbar />
              <main className="flex-1" suppressHydrationWarning>
                {children}
              </main>
              <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500" suppressHydrationWarning>
                <p>© 2026 Nova Xususiy Maktabi Transport Tizimi. Barcha huquqlar himoyalangan.</p>
              </footer>
            </div>
          </ClientOnly>
        </SystemProvider>
      </body>
    </html>
  );
}
