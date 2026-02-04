import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  onClose?: () => void;
}

interface NavLink {
  label: string;
  path: string;
  icon: string;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { isAdmin, isTeacher } = useAuth();
  const location = useLocation();

  const adminLinks: NavLink[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
    { label: 'Borrow Requests', path: '/admin/requests', icon: '📋' },
    { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
    { label: 'Reports', path: '/admin/reports', icon: '📄' },
  ];

  const teacherLinks: NavLink[] = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
    { label: 'Browse Inventory', path: '/teacher/inventory', icon: '🔍' },
    { label: 'My Reservations', path: '/teacher/reservations', icon: '📋' },
    { label: 'Activity Logs', path: '/teacher/activity-logs', icon: '📈' },
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : [];

  return (
    <aside style={{
      background: 'linear-gradient(180deg, #2d7a3e 0%, #1e5a2e 100%)',
      minHeight: '100vh',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Brand */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          📦
        </div>
        <h3 style={{
          color: 'white',
          margin: 0,
          fontWeight: '600',
          fontSize: '1rem'
        }}>
          OlineIMS
        </h3>
      </div>

      {/* Navigation */}
      <nav style={{
        padding: '0 10px',
        flex: 1,
        overflowY: 'auto'
      }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                margin: '5px 0',
                borderRadius: '0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '1.2rem' }}>{link.icon}</span>
              <span style={{ fontWeight: '500' }}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer in Sidebar */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: 0 }}>OlineIMS v1.0</p>
      </div>
    </aside>
  );
}
