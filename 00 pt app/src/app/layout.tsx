import "./globals.css";
import { Epilogue } from "next/font/google";

const epilogue = Epilogue({
  subsets: ["latin", "latin-ext"],
  display: "swap"
});

export const metadata = {
  title: "PT App",
  description: "Multi-tenant szemelyi edzo platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={epilogue.className}>{children}</body>
    </html>
  );
}
