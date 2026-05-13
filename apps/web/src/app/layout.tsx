import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusOS | Intelligent Service Management",
  description: "Gestão premium de assistência técnica e ordens de serviço.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen overflow-hidden flex bg-background text-foreground`}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="w-64 border-r bg-background h-screen shrink-0" />}>
              <Sidebar />
            </Suspense>
            <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
              <div className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                {children}
              </div>
            </main>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
