import type { Metadata } from 'next';
import { Roboto, Open_Sans } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import QueryProvider from '@/providers/QueryProvider';
import { BrandThemeProvider } from '@/providers/BrandThemeProvider';
import { FeatureFlagsProvider } from '@/providers/FeatureFlagsProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToasterProvider } from '@/components/providers/ToasterProvider';
import { ModalProvider } from '@/context/ModalContext';
import { GlobalModal } from '@/components/ui/modal/GlobalModal';
import { ADMIN_THEME_BOOT_SCRIPT } from '@/lib/theme-boot';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EHS Admin',
  description:
    'EHS Administration Dashboard — Manage users, media, websites, communications, and system settings.',
  keywords: ['admin', 'dashboard', 'ehs', 'management'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${openSans.variable}`}>
      <head>
        {/* Pre-paint brand restore — applies the cached colors from the
            previous session (works on the logged-out login page too), so
            there is no default-red flash while the settings fetch runs. */}
        <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${openSans.className} dark:bg-gray-900`}>
        <ToasterProvider />
        <QueryProvider>
          <FeatureFlagsProvider>
            <BrandThemeProvider>
              <ThemeProvider>
                <ModalProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                  <GlobalModal />
                </ModalProvider>
              </ThemeProvider>
            </BrandThemeProvider>
          </FeatureFlagsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
