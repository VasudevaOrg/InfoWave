'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentCertificatesPage() {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/student/dashboard');
      const data = await res.json();
      if (res.ok) {
        setCompleted(data.completedCourses || []);
      } else {
        setError(data.error || 'Failed to fetch completed courses');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch certificate dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestCertificate = async (enrollmentId) => {
    setError('');
    setSuccess('');
    setRequestingId(enrollmentId);
    try {
      const res = await fetch('/api/student/certificate-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enrollmentId })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Certificate request successfully submitted to the instructor!');
        loadData();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>My Certificates</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Request and print completion certificates for your completed training programs.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#e6fdf5',
          border: '1px solid #a7f3d0',
          color: '#10b981',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading completed courses data...
        </div>
      ) : completed.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          No completed courses recorded.
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
            When the instructor marks your active course as completed, you will be able to request your certificate from this panel.
          </p>
        </div>
      ) : (
        /* Certificates list */
        <div className="grid-cols-2">
          {completed.map((cert) => (
            <div key={cert._id} className="card" style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              
              {/* Status Ribbon Indicator */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: '20px',
                width: '32px',
                height: '48px',
                backgroundColor: cert.certificateRequestStatus === 'approved' ? '#10b981' : cert.certificateRequestStatus === 'requested' ? '#f59e0b' : '#64748b',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 700
              }}>
                {cert.certificateRequestStatus === 'approved' ? '✓' : '?'}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#0054a6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Course Completion Registry
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, marginTop: '0.25rem', paddingRight: '2rem' }}>
                  {cert.courseId?.title}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '1.5rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b' }}>Certificate Status:</span>
                    <strong style={{
                      color: cert.certificateRequestStatus === 'approved' ? '#10b981' : cert.certificateRequestStatus === 'requested' ? '#d97706' : '#64748b'
                    }}>
                      {cert.certificateRequestStatus === 'approved' ? 'Approved & Issued' : cert.certificateRequestStatus === 'requested' ? 'Pending Admin Approval' : 'Certificate Not Requested'}
                    </strong>
                  </div>
                  {cert.certificateRequestStatus === 'approved' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b' }}>Certificate ID:</span>
                      <strong style={{ color: '#0f172a' }}>{cert.certificateId}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b' }}>Course Duration:</span>
                    <strong style={{ color: '#475569' }}>{cert.courseId?.duration}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b' }}>Completed On:</span>
                    <strong style={{ color: '#475569' }}>
                      {cert.completedAt ? new Date(cert.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div style={{ marginTop: '1rem' }}>
                {cert.certificateRequestStatus === 'none' && (
                  <button
                    onClick={() => handleRequestCertificate(cert._id)}
                    disabled={requestingId === cert._id}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
                  >
                    {requestingId === cert._id ? 'Submitting Request...' : 'Request Completion Certificate'}
                  </button>
                )}

                {cert.certificateRequestStatus === 'requested' && (
                  <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    Awaiting admin verification and PDF release.
                  </div>
                )}

                {cert.certificateRequestStatus === 'approved' && (
                  <a
                    href={`/certificate/${cert.certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem 1.25rem', textAlign: 'center', display: 'block' }}
                  >
                    Print Verified Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
