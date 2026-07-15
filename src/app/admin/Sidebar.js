'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminSidebar({ adminName, adminEmail, adminPhoto }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      setLoggingOut(true);
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
        });
        if (res.ok) {
          router.push('/login');
          router.refresh();
        } else {
          alert('Logout failed');
          setLoggingOut(false);
        }
      } catch (err) {
        console.error('Logout error:', err);
        setLoggingOut(false);
      }
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manage Courses', path: '/admin/courses' },
    { name: 'Student Enrollments', path: '/admin/students' },
    { name: 'Institution Profile', path: '/admin/profile' },
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#0b132b',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: '1px solid #1c2541',
      padding: '2rem 1.5rem',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 40
    }}>
      <div>
        {/* Branding */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
          <svg width="35" height="35" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="45" width="150" height="100" rx="10" stroke="#ffffff" strokeWidth="12" fill="#0b132b" />
            <rect x="80" y="145" width="40" height="25" fill="#ffffff" />
            <path d="M50 170 H150" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
            <path d="M20 100 C 60 70, 140 130, 180 100" stroke="#ff6b12" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M20 115 C 60 85, 140 145, 180 115" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" fill="none" />
            <polygon points="90,75 120,95 90,115" fill="#ff6b12" />
          </svg>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-primary)' }}>
              Info<span style={{ color: '#ff6b12' }}>Wave</span>
            </span>
            <div style={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.5px', marginTop: '-3px' }}>
              ADMIN PANEL
            </div>
          </div>
        </Link>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  backgroundColor: isActive ? 'rgba(0, 84, 166, 0.2)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #ff6b12' : '3px solid transparent',
                  paddingLeft: isActive ? 'calc(1rem - 3px)' : '1rem'
                }}
                className="btn-ghost"
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile summary & Logout */}
      <div style={{ borderTop: '1px solid #1c2541', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#0054a6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 800,
            overflow: 'hidden',
            color: 'white',
            border: '2px solid #ff6b12'
          }}>
            {adminPhoto ? (
              <img src={adminPhoto} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              adminName ? adminName.charAt(0) : 'A'
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {adminName || 'Admin'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {adminEmail || 'admin@infowave.com'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          disabled={loggingOut}
          style={{
            width: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)'
          }}
        >
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
