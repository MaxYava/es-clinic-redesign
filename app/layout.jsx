import localFont from "next/font/local";
import "./globals.css";
const aeroport = localFont({
  src: "./aeroport.woff",
  display: "swap",
  variable: "--font-aeroport",
});
export const metadata = {
  title: "ЕС Клиника — Медицинский Family Office",
  description:
    "Единая система управления здоровьем семьи. Постоянная медицинская команда ЕС Клиники.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={aeroport.variable}>
      <body>{children}</body>
    </html>
  );
}
