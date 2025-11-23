import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instagram Auto Poster',
  description: 'Publish Instagram posts via Graph API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
        <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
