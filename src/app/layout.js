import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "O(n) Club",
  description:
    "Como Argentinos no tenemos que mirar afuera para buscar referentes",

  url: "https://www.theonclub.com/",
  image: "./favicons/android-chrome-512x512.png",
  site_name: "O(n) Club",
  images: {
    default: "https://i.imgur.com/sU5ypgr.png",
    alt: "O(n) Club",
  },
  twitter: {
    card: "website",
    title: "O(n) Club",
    description:
      "Como Argentinos no tenemos que mirar afuera para buscar referentes",
    images: ["https://i.imgur.com/sU5ypgr.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
