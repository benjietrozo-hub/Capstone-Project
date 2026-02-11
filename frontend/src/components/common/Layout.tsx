import React, { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = '' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#ffffff'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2d7a3e',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 999
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2d7a3e',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 100
        }}>
          <Header 
            title={title}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          paddingBottom: '70px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {children}
          </div>
        </main>

        {/* Footer - Fixed to bottom */}
        <Footer />
      </div>
    </div>
  );
}
