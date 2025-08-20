import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Worker Vitals Dashboard',
  description: 'Real-time worker vitals dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          <header className="header">
            <h1>Worker Vitals Dashboard</h1>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
