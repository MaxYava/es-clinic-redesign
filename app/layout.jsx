import localFont from "next/font/local";
import "./globals.css";
const aeroport = localFont({
  src: "./aeroport.woff",
  display: "swap",
  variable: "--font-aeroport",
});
const germes = localFont({
  src: [
    { path: "./fonts/Germes_Light.otf", weight: "300" },
    { path: "./fonts/Germes_Regular.otf", weight: "400" },
    { path: "./fonts/Germes_Bold.otf", weight: "700" },
  ],
  display: "swap",
  variable: "--font-germes",
});
export const metadata = {
  title: "ЕС Клиника – Медицинский Family Office",
  description:
    "Единая система управления здоровьем семьи. Постоянная медицинская команда ЕС Клиники.",
  robots: { index: false, follow: false },
  icons: { icon: "/clinic-favicon.ico", shortcut: "/clinic-favicon.ico" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${aeroport.variable} ${germes.variable}`}>
      <head>
        <link rel="preload" as="image" href="/assets/original-first-screen/1d6c2900267b6b8d.png" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
