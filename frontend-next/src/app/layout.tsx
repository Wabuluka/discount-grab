import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GeoProvider } from "@/providers/GeoProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import JsonLd from "@/components/JsonLd";
import { defaultMetadata, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/seo";

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <JsonLd data={generateOrganizationJsonLd()} />
        <JsonLd data={generateWebsiteJsonLd()} />
      </head>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <GeoProvider>
            <StoreProvider>
              <QueryProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </QueryProvider>
            </StoreProvider>
          </GeoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
