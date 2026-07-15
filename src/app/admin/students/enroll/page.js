'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminStudentEnrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) {
      router.push('/admin/students');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch students and courses lists
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        
        if (res.ok) {
          // Find the target student
          const targetStudent = data.students.find(s => s._id === studentId);
          if (!targetStudent) {
            setError('Student profile not found in active registries.');
          } else {
            setStudent(targetStudent);
          }
          
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourseId(data.courses[0]._id);
          }
        } else {
          setError(data.error || 'Failed to fetch student details.');
        }
      } catch (err) {
        console.error(err);
        setError('Network connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student._id,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register student enrollment');
      }

      router.push('/admin/students');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
        Loading enrollment workspace parameters...
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
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, marginTop: '0.75rem' }}>
          Register Course Enrollment
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Register a direct, active student enrollment bypassing student-initiated approvals.
        </p>
      </div>

      {error && !student ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', backgroundColor: 'white' }}>
          <h3>⚠️ Profile Error</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>{error}</p>
          <Link href="/admin/students" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Go Back
          </Link>
        </div>
      ) : (
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          
          {/* Student Dossier Badge */}
          {student && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#0054a6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                overflow: 'hidden'
              }}>
                {student.profileImage ? (
                  <img src={student.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  student.name.charAt(0)
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{student.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Roll No: {student.admissionNo || 'N/A'} | Email: {student.email}
                </span>
              </div>
            </div>
          )}

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

          {courses.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
              No available courses found in the catalogue. Please create a course first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="enroll-course">Select Course Offer</label>
                <select
                  id="enroll-course"
                  className="form-input"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                  disabled={submitting}
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} (Duration: {course.duration} | Fees: ₹{course.fees?.toLocaleString('en-IN') || '0'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course preview snippet */}
              {selectedCourseId && (() => {
                const selected = courses.find(c => c._id === selectedCourseId);
                if (!selected) return null;
                return (
                  <div style={{
                    backgroundColor: '#fafbfc',
                    border: '1px dashed #cbd5e1',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#475569'
                  }}>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>Course Details:</strong>
                    <div>Eligibility: {selected.eligibility || 'Open'}</div>
                    <div style={{ marginTop: '0.25rem' }}>Description: {selected.description}</div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <Link href="/admin/students" className="btn btn-outline" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  );
}
