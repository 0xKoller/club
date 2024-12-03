import "./globals.css";

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
      <body>
        <div className="terminal-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
