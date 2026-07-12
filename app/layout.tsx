import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InternHousing",
  description: "Short-term housing for interns and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}