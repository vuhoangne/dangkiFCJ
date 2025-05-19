import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Logo from './components/Logo';

export const metadata: Metadata = {
  title: 'Đăng Ký Văn Phòng',
  description: 'Hệ thống đăng ký lên văn phòng',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="vi">
      <body>
        <header>
          <div className="container">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '10px 0',
              width: '100%'
            }}>
              <h1 style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '28px', 
                margin: 0,
                textAlign: 'center'
              }}>FIRST CLOUD JOURNEY</h1>
            </div>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
