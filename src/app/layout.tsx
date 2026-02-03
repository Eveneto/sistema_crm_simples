import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/animations.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM',
  description: 'Sistema de CRM completo com integração WhatsApp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>

        <Script
          src="https://d2mpatx37cqexb.cloudfront.net/delightchat-whatsapp-widget/embeds/embed.min.js"
          strategy="afterInteractive"
        />
        <Script id="whatsapp-widget" strategy="afterInteractive">
          {`var wa_btnSetting = {"btnColor":"#16BE45","ctaText":"WhatsApp Us","cornerRadius":40,"marginBottom":20,"marginLeft":20,"marginRight":20,"btnPosition":"right","whatsAppNumber":"911234567890","welcomeMessage":"Hello","zIndex":999999,"btnColorScheme":"light"};
var wa_widgetSetting = {"title":"CRM","subTitle":"Normalmente responde em um dia","headerBackgroundColor":"#FBFFC8","headerColorScheme":"dark","greetingText":"Como podemos ajudar?","ctaText":"Iniciar Chat","btnColor":"#1A1A1A","cornerRadius":40,"welcomeMessage":"Hello","btnColorScheme":"light","brandImage":"https://uploads-ssl.webflow.com/5f68a65cd5188c058e27c898/6204c4267b92625c9770f687_whatsapp-chat-widget-dummy-logo.png","darkHeaderColorScheme":{"title":"#333333","subTitle":"#4F4F4F"}};
window.onload = () => {
  _waEmbed(wa_btnSetting, wa_widgetSetting);
};`}
        </Script>
      </body>
    </html>
  );
}
