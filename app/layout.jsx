import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Footer from "./components/Footer"; // Import the new Footer

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Fake News Detector | Fact-Checking Assistant",
  description: "An intelligent tool that analyzes news articles and images for potential misinformation. Get AI-powered fact-checking, source verification, and a confidence score to combat the spread of fake news.",
  applicationName: "AI Fake News Detector",
  keywords: ["Fake News", "AI", "Fact-Checking", "Misinformation", "News Analysis", "Machine Learning", "Next.js", "Vercel"],
  creator: "Your Name Here",
  icons: {
    icon: "/favicon.ico",
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* The body is now a flex container to push the footer to the bottom */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          {/* Children are wrapped in a main tag that grows to fill available space */}
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}