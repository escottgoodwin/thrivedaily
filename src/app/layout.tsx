import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { LanguageProvider } from '@/components/i18n/language-provider';
import { SubscriptionProvider } from '@/components/subscriptions/subscription-provider';
import { UsageProvider } from '@/components/subscriptions/usage-provider';

export const metadata: Metadata = {
  title: 'Thrive Daily',
  description: 'Your personal development companion for a more mindful and fulfilling life.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
                <SubscriptionProvider>
                  <UsageProvider>
                    <AppShell>{children}</AppShell>
                    <Toaster />
                  </UsageProvider>
                </SubscriptionProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
