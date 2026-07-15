'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollCourseId = searchParams.get('enrollCourseId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // If logging in as a student with pending courses, automatically enroll them!
      if (data.user.role === 'student' && enrollCourseId) {
        const courseIds = enrollCourseId.split(',');
        for (const cid of courseIds) {
          try {
            await fetch('/api/student/enroll', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ courseId: cid }),
            });
          } catch (err) {
            console.error('Auto-enrollment failed for course:', cid, err);
          }
        }
        alert('Credentials verified! You have been successfully enrolled in your selected course(s).');
      }

      // Route based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // Quick fill helper for easy testing
  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@infowave.com');
      setPassword('admin_infowave_2026');
    } else {
      setEmail('demo@student.com');
      setPassword('student123');
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login simulation: In production, this redirects to the secure OAuth authorization screen.`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: '1.5rem',
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '8px',
        padding: '2.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        zIndex: 10
      }}>
        {/* Header Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <svg width="36" height="36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="45" width="150" height="100" rx="10" stroke="#0054a6" strokeWidth="12" fill="white" />
              <rect x="80" y="145" width="40" height="25" fill="#0054a6" />
              <path d="M50 170 H150" stroke="#0054a6" strokeWidth="12" strokeLinecap="round" />
              <path d="M20 100 C 60 70, 140 130, 180 100" stroke="#ff6b12" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M20 115 C 60 85, 140 145, 180 115" stroke="#0054a6" strokeWidth="8" strokeLinecap="round" fill="none" />
              <polygon points="90,75 120,95 90,115" fill="#ff6b12" />
            </svg>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0054a6', fontFamily: 'var(--font-primary)' }}>
              Info<span style={{ color: '#ff6b12' }}>Wave</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Sign In to Your Account</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Enter credentials or use demo quick-fill</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Dynamic Alert for pending course enrollment redirect */}
        {enrollCourseId && (
          <div style={{
            backgroundColor: '#e6f0fa',
            border: '1px solid #0054a6',
            color: '#0054a6',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}>
            <strong>Enrollment Queue:</strong> Logging in as a student will automatically register you for classes.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                style={{ width: '100%', paddingRight: '3.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#0054a6',
                  userSelect: 'none'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>


        <div style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem'
        }}>
          <span>New student? Contact the administration office to receive your login credentials.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b132b',
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 800
      }}>
        Loading InfoWave Login Portal...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
