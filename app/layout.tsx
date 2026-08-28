import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Novr Academy",
  description: "Corporate learning platform and career community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v2/inline.js" async />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
