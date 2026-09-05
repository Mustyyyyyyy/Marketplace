import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskSphere — Get Things Done. Find the Right Person.',
  description: 'Post a task, find trusted people to help, or turn your skills into income.',
  icons: 'https://lh3.googleusercontent.com/aida/AEtjO1V29C17769QivY-cBn1fflBw8aq6rLLnnCnd-qd0d_17M6cTqMO0_vo0LYRaLx5tz-MCuD0YqqJclFfv8ZsURf88mHX4parxss3msLfNay5g58MxIv4Wzj4lJLCX_rSAS1ljGqbnPSUcWUamkWck4PLKoLUczBpCTkySOQS22ONiUMdbppUaNli1LelPWF49VqLkFpazDciqGE86u3Vjkuag9sLT5DFWGGvd1JZiHXN4feXnamCM7585A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
