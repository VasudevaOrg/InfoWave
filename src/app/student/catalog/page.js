'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch public course catalog list
      const courseRes = await fetch('/api/admin/courses');
      const courseData = await courseRes.json();
      
      // Fetch student's specific panel data to identify enrolled course IDs
      const studentRes = await fetch('/api/student/dashboard');
      const studentData = await studentRes.json();

      if (courseRes.ok) {
        setCourses(courseData.courses);
      }
      if (studentRes.ok) {
        // Collect all active and completed course IDs
        const enrolledIds = [
          ...studentData.activeCourses.map(c => c.courseId?._id),
          ...studentData.completedCourses.map(c => c.courseId?._id)
        ];
        setEnrollments(enrolledIds);
      }
    } catch (err) {
      console.error('Error loading catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (courseId) => {
    if (confirm('Enroll in this course? Once confirmed, you can start classes immediately in the training lab.')) {
      setEnrollingId(courseId);
      try {
        const res = await fetch('/api/student/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId }),
        });

        const data = await res.json();
        if (res.ok) {
          alert('Successfully enrolled! Routing to your courses panel...');
          router.push('/student/dashboard');
          router.refresh();
        } else {
          alert(data.error || 'Failed to enroll');
        }
      } catch (err) {
        console.error('Enrollment error:', err);
      } finally {
        setEnrollingId(null);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Course Catalog</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Explore all computer training classes offered at InfoWave and self-enroll.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading course catalog...
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', backgroundColor: 'white' }}>
          No courses are registered in the catalog yet.
        </div>
      ) : (
        /* Catalog list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {courses.map((course) => {
            const isEnrolled = enrollments.includes(course._id);
            return (
              <div key={course._id} className="card" style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '2rem',
                alignItems: 'center'
              }}>
                {/* Visual block */}
                <div style={{
                  height: '120px',
                  borderRadius: '12px',
                  background: course.image?.startsWith('linear-gradient') ? course.image : 'transparent',
                  backgroundColor: !course.image?.startsWith('linear-gradient') ? '#0054a6' : 'transparent',
                  backgroundImage: course.image && !course.image.startsWith('linear-gradient') ? `url(${course.image})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}>
                  {course.duration}
                </div>

                {/* Details block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flexGrow: 1, maxWidth: '600px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginTop: '0.5rem' }}>
                      {course.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                      <span>⌛ Duration: {course.duration}</span>
                      <span>💰 Tuition: ₹{course.fees?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  </div>

                  <div>
                    {isEnrolled ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#e6fdf5',
                        color: '#10b981',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        ✓ Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollingId === course._id}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderRadius: '8px' }}
                      >
                        {enrollingId === course._id ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
