'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all students and their enrollments
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Fetch student records error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unified Enrollment Action Helper (kept for the pending approvals top queue)
  const handleAction = async (enrollmentId, action, courseTitle, studentName) => {
    let confirmMsg = '';
    if (action === 'approve_enrollment') confirmMsg = `Approve and activate "${courseTitle}" enrollment for ${studentName}?`;
    if (action === 'reject_enrollment') confirmMsg = `Reject and delete "${courseTitle}" enrollment request for ${studentName}?`;
    if (action === 'approve_certificate') confirmMsg = `Approve and generate Completion Certificate for "${courseTitle}" for ${studentName}?`;

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

  // Extract all pending enrollments and certificate requests across all students
  const pendingEnrollments = [];
  const certificateRequests = [];

  students.forEach((student) => {
    if (student.enrollments) {
      student.enrollments.forEach((enr) => {
        if (enr.status === 'pending') {
          pendingEnrollments.push({
            ...enr,
            studentName: student.name,
            studentEmail: student.email
          });
        }
        if (enr.status === 'completed' && enr.certificateRequestStatus === 'requested') {
          certificateRequests.push({
            ...enr,
            studentName: student.name,
            studentEmail: student.email
          });
        }
      });
    }
  });

  // Filter students based on search query (search by name, email, or admission number)
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.admissionNo && student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Student Records</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Browse enrolled student files, manage activations, and approve credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search name, email, or roll no..."
            className="form-input"
            style={{ width: '270px', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Link href="/admin/students/new" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            Register New Student
          </Link>
        </div>
      </div>

      {/* Pending Actions Queue Command Center */}
      {(pendingEnrollments.length > 0 || certificateRequests.length > 0) && (
        <div className="card" style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Action Required: Pending Approvals Queue
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Enrollment requests list */}
            {pendingEnrollments.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Course Enrollment Requests ({pendingEnrollments.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pendingEnrollments.map((enr) => (
                    <div key={enr._id} style={{
                      backgroundColor: 'white',
                      border: '1px solid #fef3c7',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <strong>{enr.studentName}</strong> requested enrollment in <strong style={{ color: '#0054a6' }}>{enr.courseId?.title}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Email: {enr.studentEmail} | Requested: {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleAction(enr._id, 'approve_enrollment', enr.courseId?.title, enr.studentName)}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(enr._id, 'reject_enrollment', enr.courseId?.title, enr.studentName)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444', backgroundColor: 'transparent' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate requests list */}
            {certificateRequests.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Certificate Approval Requests ({certificateRequests.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {certificateRequests.map((enr) => (
                    <div key={enr._id} style={{
                      backgroundColor: 'white',
                      border: '1px solid #fef3c7',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <strong>{enr.studentName}</strong> completed <strong style={{ color: '#ff6b12' }}>{enr.courseId?.title}</strong> and requested certificate release.
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Email: {enr.studentEmail} | Completed: {enr.completedAt ? new Date(enr.completedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div>
                        <button
                          onClick={() => handleAction(enr._id, 'approve_certificate', enr.courseId?.title, enr.studentName)}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', backgroundColor: '#0054a6', borderColor: '#0054a6' }}
                        >
                          Approve & Issue Certificate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading student files...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', backgroundColor: 'white' }}>
          {searchQuery ? 'No student records match your search filter.' : 'No students registered in the database yet. Click "Register New Student" to add a profile.'}
        </div>
      ) : (
        /* Compact Student Cards Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {filteredStudents.map((student) => (
            <div key={student._id} className="card" style={{
              backgroundColor: 'white',
              border: student.isActive === false ? '1px dashed #ef4444' : '1px solid #e2e8f0',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
              opacity: student.isActive === false ? 0.85 : 1,
              position: 'relative'
            }}>
              
              {/* Card Profile Area */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: student.isActive === false ? '#64748b' : '#0054a6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
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
                  <h2 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {student.name}
                    {student.isActive === false && (
                      <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.3rem',
                        borderRadius: '3px',
                        border: '1px solid #fecaca',
                        textTransform: 'uppercase'
                      }}>
                        Deactivated
                      </span>
                    )}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Roll No: <strong>{student.admissionNo || 'N/A'}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Details List */}
              <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Email:</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{student.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Contact:</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{student.cellNo ? `+91 ${student.cellNo}` : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Enrolled Courses:</span>
                  <strong style={{ color: '#0054a6' }}>{student.enrollments?.length || 0} courses</strong>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Link href={`/admin/students/details?id=${student._id}`} className="btn btn-primary" style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', textAlign: 'center', borderRadius: '6px', display: 'block' }}>
                  View Full File & Actions
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
