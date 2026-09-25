import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DompetKuProvider } from '@/lib/store';
import { AppShell } from '@/components/layout/app-shell';
import { PwaRegister } from '@/components/pwa/pwa-register';

const plusJakartaSans = localFont({
  src: './fonts/PlusJakartaSans-Variable.woff2',
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DompetKu — Pelacak Keuangan Pribadi',
  description:
    'Aplikasi web untuk mencatat, mengelola, dan memantau keuangan pribadi dengan mudah, cepat, dan akurat.',
  applicationName: 'DompetKu',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DompetKu',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: [
    'keuangan pribadi',
    'pelacak keuangan',
    'anggaran',
    'tabungan',
    'catat pengeluaran',
    'DompetKu',
    'PWA',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          id="theme-font-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('dompetku_data_v1_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark) || (savedTheme === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  var savedFontSize = localStorage.getItem('dompetku_data_v1_fontSize');
                  var sizeMap = { sm: '14px', normal: '16px', lg: '18px', xl: '20px' };
                  if (savedFontSize && sizeMap[savedFontSize]) {
                    document.documentElement.dataset.fontSize = savedFontSize;
                    document.documentElement.style.fontSize = sizeMap[savedFontSize];
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans antialiased text-zinc-900 bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
        <DompetKuProvider>
          <AppShell>{children}</AppShell>
          <PwaRegister />
        </DompetKuProvider>
      </body>
    </html>
  );
}
