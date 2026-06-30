import './globals.css';

export const metadata = {
  title: 'INNOVIBE EV Fleet Platform',
  description: 'Enterprise AI-Powered EV Fleet Management & Command Center',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface min-h-screen antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
