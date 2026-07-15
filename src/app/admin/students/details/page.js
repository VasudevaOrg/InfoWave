'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminStudentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!studentId) {
      router.push('/admin/students');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      
      if (res.ok) {
        const targetStudent = data.students.find(s => s._id === studentId);
        if (!targetStudent) {
          setError('Student profile not found.');
        } else {
          setStudent(targetStudent);
        }
      } else {
        setError(data.error || 'Failed to fetch student profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  // Unified Action Helper
  const handleAction = async (enrollmentId, action, courseTitle) => {
    let confirmMsg = '';
    if (action === 'approve_enrollment') confirmMsg = `Approve and activate "${courseTitle}" enrollment for ${student?.name}?`;
    if (action === 'reject_enrollment') confirmMsg = `Reject and delete "${courseTitle}" enrollment request for ${student?.name}?`;
    if (action === 'mark_completed') confirmMsg = `Mark "${courseTitle}" as completed for ${student?.name}?`;
    if (action === 'approve_certificate') confirmMsg = `Approve and generate Completion Certificate for "${courseTitle}" for ${student?.name}?`;

    if (!confirmMsg || confirm(confirmMsg)) {
      try {
        const res = await fetch('/api/admin/students', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enrollmentId, action }),
        });

        const data = await res.json();

        if (res.ok) {
          fetchData();
        } else {
          alert(data.error || 'Operation failed');
        }
      } catch (err) {
        console.error('Action execution error:', err);
      }
    }
  };

  // Toggle Student Account Active/Deactive State
  const handleToggleActive = async () => {
    const nextState = student.isActive === false ? 'reactivate' : 'deactivate';
    const confirmMsg = `${nextState.toUpperCase()} student account for ${student.name}?\n` +
      (student.isActive !== false 
        ? 'Deactivated students will be immediately blocked from logging into their dashboard.' 
        : 'Reactivated students will be allowed to log back into their dashboard.');

    if (confirm(confirmMsg)) {
      try {
        const res = await fetch('/api/admin/students', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId: student._id, action: 'toggle_active' }),
        });

        const data = await res.json();

        if (res.ok) {
          fetchData();
        } else {
          alert(data.error || 'Operation failed');
        }
      } catch (err) {
        console.error('Toggle active state error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
        Loading student profile file...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="fade-in" style={{ width: '100%' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', backgroundColor: 'white' }}>
          <h3>⚠️ Data Error</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>{error || 'Student not found.'}</p>
          <Link href="/admin/students" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Back to Students list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      
      {/* Header breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/students" style={{ fontSize: '0.85rem', color: '#0054a6', fontWeight: 700, textDecoration: 'underline' }}>
          ← Back to Student Records
        </Link>
      </div>

      <div className="card" style={{
        backgroundColor: 'white',
        border: student.isActive === false ? '1px dashed #ef4444' : '1px solid #e2e8f0',
        padding: '2rem',
        position: 'relative',
        opacity: student.isActive === false ? 0.9 : 1
      }}>
        
        {/* Profile Summary Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: student.isActive === false ? '#64748b' : '#0054a6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              overflow: 'hidden',
              border: '2px solid #e2e8f0'
            }}>
              {student.profileImage ? (
                <img src={student.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                student.name.charAt(0)
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {student.name}
                {student.isActive === false && (
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    border: '1px solid #fecaca',
                    textTransform: 'uppercase'
                  }}>
                    Deactivated
                  </span>
                )}
              </h1>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {student.email} | Cell: {student.cellNo ? `+91 ${student.cellNo}` : 'N/A'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleToggleActive}
              className="btn"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                color: student.isActive === false ? '#10b981' : '#ef4444',
                border: student.isActive === false ? '1px solid #10b981' : '1px solid #ef4444',
                backgroundColor: 'transparent'
              }}
            >
              {student.isActive === false ? 'Reactivate Profile' : 'Deactivate Profile'}
            </button>

            <Link href={`/admin/students/enroll?studentId=${student._id}`} className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem', borderRadius: '8px' }}>
              Register Course Enrollment
            </Link>
          </div>
        </div>

        {/* Dossier Grid Details */}
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Personal Dossier File
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#475569',
          marginBottom: '2rem',
          border: '1px solid #f1f5f9'
        }}>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Roll / Admission No</span>
            <strong style={{ color: '#0f172a' }}>{student.admissionNo || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>DOB & Gender</span>
            <strong style={{ color: '#0f172a' }}>{student.dob ? student.dob : 'N/A'} ({student.gender || 'N/A'})</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Blood Group</span>
            <strong style={{ color: '#0f172a' }}>{student.bloodGroup || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Alternate Contact</span>
            <strong style={{ color: '#0f172a' }}>{student.altCellNo ? `+91 ${student.altCellNo}` : 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Highest Qualification</span>
            <strong style={{ color: '#0f172a' }}>{student.qualification || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Current Status</span>
            <strong style={{ color: '#0f172a' }}>{student.status || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>School / College / Organization</span>
            <strong style={{ color: '#0f172a' }}>{student.schoolCollege || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Location Address</span>
            <strong style={{ color: '#0f172a' }}>
              {student.address ? `${student.address}, ${student.district || ''} (${student.pincode || ''})` : 'N/A'}
            </strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>Training Mode</span>
            <strong style={{ color: '#0054a6' }}>{student.modeOfTraining || 'Daily Class'}</strong>
          </div>
        </div>

        {/* Qualifications History timeline */}
        {student.academicHistory && student.academicHistory.length > 0 && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '1.5rem',
            fontSize: '0.85rem',
            color: '#475569',
            marginBottom: '2rem'
          }}>
            <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
              Academic Qualification History
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {student.academicHistory.map((acad, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: idx < student.academicHistory.length - 1 ? '1px dashed #e2e8f0' : 'none',
                  paddingBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <span>🎓 <strong style={{ color: '#0f172a' }}>{acad.qualification}</strong> at <em>{acad.institution}</em></span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Passed: <strong>{acad.passingYear || 'N/A'}</strong> | Marks/Grade: <strong>{acad.percentage || 'N/A'}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrolled Courses list */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Course Enrollments & Actions
          </h3>
          
          {student.enrollments.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
              Student is not currently enrolled in any course.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {student.enrollments.map((enr) => (
                <div key={enr._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                      {enr.courseId?.title || 'Deleted Course'}
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      <span>Duration: {enr.courseId?.duration}</span>
                      <span>Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                      {enr.completedAt && <span>Completed: {new Date(enr.completedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div>
                    {/* Pending Approval enrollment state */}
                    {enr.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #fde68a'
                        }}>
                          Pending Request
                        </span>
                        <button
                          onClick={() => handleAction(enr._id, 'approve_enrollment', enr.courseId?.title)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#10b981', border: 'none' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(enr._id, 'reject_enrollment', enr.courseId?.title)}
                          className="btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', backgroundColor: 'transparent' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Active state */}
                    {enr.status === 'active' && (
                      <button
                        onClick={() => handleAction(enr._id, 'mark_completed', enr.courseId?.title)}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          backgroundColor: '#10b981',
                          border: 'none'
                        }}
                      >
                        Mark Complete
                      </button>
                    )}

                    {/* Completed state */}
                    {enr.status === 'completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#e6fdf5',
                          color: '#10b981',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          Completed
                        </span>

                        {/* Certificate state */}
                        {enr.certificateRequestStatus !== 'approved' ? (
                          <button
                            onClick={() => handleAction(enr._id, 'approve_certificate', enr.courseId?.title)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#0054a6', border: 'none' }}
                          >
                            {enr.certificateRequestStatus === 'requested' ? 'Approve & Issue Certificate' : 'Issue Certificate Directly'}
                          </button>
                        ) : (
                          enr.certificateId && (
                            <a
                              href={`/certificate/${enr.certificateId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.8rem',
                                color: '#0054a6',
                                fontWeight: 700,
                                textDecoration: 'underline'
                              }}
                              className="btn-ghost"
                            >
                              View Certificate ({enr.certificateId.split('-').pop()})
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
