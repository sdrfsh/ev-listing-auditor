import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Drawer } from "./components/drawer";
import { Providers } from "./theme/providers";


export default function RootLayout({children}: {children: React.ReactNode;}): React.ReactElement {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            <Drawer />
            <main className="flex-1 p-6">{children}</main>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
