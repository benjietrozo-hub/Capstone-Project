import React from 'react';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#000000',
      color: '#ffffff',
      textAlign: 'center',
      padding: '15px 20px',
      borderTop: '1px solid #333',
      fontSize: '0.9rem',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50
    }}>
      <p style={{ margin: 0, color: '#ffffff' }}>
        Online Inventory of Other Properties for Tools and Equipment. All rights reserved.
      </p>
    </footer>
  );
}
