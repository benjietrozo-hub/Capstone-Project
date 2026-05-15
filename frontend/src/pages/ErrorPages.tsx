import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/common/Footer';

export function NotFoundPage() {
  return (
    <>
      {/* Header */}
      <header style={{
        padding: '0 20px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'white',
          textAlign: 'center'
        }}>
          Online Inventory Management System
        </h1>
      </header>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20" style={{ paddingTop: '90px' }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-8">Page not found</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export function UnauthorizedPage() {
  return (
    <>
      {/* Header */}
      <header style={{
        padding: '0 20px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'white',
          textAlign: 'center'
        }}>
          Online Inventory Management System
        </h1>
      </header>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20" style={{ paddingTop: '90px' }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-2xl text-gray-600 mb-4">Access Denied</p>
          <p className="text-gray-600 mb-8">You don't have permission to access this page</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
