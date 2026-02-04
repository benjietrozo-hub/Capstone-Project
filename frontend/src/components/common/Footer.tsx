import React from 'react';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      textAlign: 'center',
      padding: '15px 20px',
      borderTop: '1px solid #333',
      fontSize: '0.9rem'
    }}>
      <p style={{ margin: 0, color: '#cccccc' }}>
        &copy; 2026 Online Inventory Management System. All rights reserved.
      </p>
    </footer>
  );
}
