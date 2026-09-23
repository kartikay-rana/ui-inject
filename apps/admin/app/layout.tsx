import '@tech-inject/theme/styles.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tech Inject — Admin',
  description: 'Component library administration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="tech-inject">
      <body>{children}</body>
    </html>
  );
}