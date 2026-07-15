'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses from the database
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will permanently remove the course and delete all active/completed student enrollments associated with it.`)) {
      try {
        const res = await fetch(`/api/admin/courses?id=${id}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (res.ok) {
          fetchCourses();
        } else {
          alert(data.error || 'Failed to delete course');
        }
      } catch (err) {
        console.error('Delete course error:', err);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Manage Courses</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Add, configure, or remove digital training course offerings.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
          ➕ Add New Course
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading courses catalog...
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', backgroundColor: 'white' }}>
          No courses currently registered. Click "Add New Course" to populate the catalog.
        </div>
      ) : (
        /* Courses List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {courses.map((course) => (
            <div key={course._id} className="card" style={{
              display: 'grid',
              gridTemplateColumns: '250px 1fr',
              gap: '2.5rem',
              padding: '1.75rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              alignItems: 'start'
            }}>
              
              {/* Left Column: Visual Banner and quick statistics */}
              <div>
                <div style={{
                  height: '140px',
                  borderRadius: '12px',
                  background: course.image?.startsWith('linear-gradient') ? course.image : 'transparent',
                  backgroundColor: !course.image?.startsWith('linear-gradient') ? '#0054a6' : 'transparent',
                  backgroundImage: course.image && !course.image.startsWith('linear-gradient') ? `url(${course.image})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  color: 'white',
                  marginBottom: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    width: 'fit-content'
                  }}>
                    {course.duration}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {course.abbreviation || course.title.split(' ')[0]}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                    <span>Tuition Cost:</span>
                    <strong style={{ color: '#ff6b12', fontSize: '0.95rem' }}>₹{course.fees?.toLocaleString('en-IN') || '0'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                    <span>Batch Delivery:</span>
                    <strong style={{ color: '#0f172a' }}>{course.batchMode || 'Daily Class'}</strong>
                  </div>
                  {course.keyboardSpeed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                      <span>Typing speed:</span>
                      <strong style={{ color: '#0f172a' }}>{course.keyboardSpeed}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <Link href={`/admin/courses/new?editCourseId=${course._id}`} className="btn btn-outline" style={{ flexGrow: 1, padding: '0.5rem', fontSize: '0.85rem', borderRadius: '8px', textAlign: 'center' }}>
                    ✏️ Edit
                  </Link>
                  <button onClick={() => handleDelete(course._id, course.title)} className="btn" style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.15)',
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* Right Column: Complete Course details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>{course.title}</h2>
                    {course.abbreviation && (
                      <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>({course.abbreviation})</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginTop: '0.5rem' }}>
                    {course.description}
                  </p>
                </div>

                {/* Grid detailing prerequisites, outcomes, software, eligibility */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>Eligibility Criterion</span>
                    <strong>{course.eligibility || 'Open Admission'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>Recommended Software</span>
                    <strong>{course.recommendedSoftware || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>Prerequisites</span>
                    <strong>{course.prerequisites || 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>Skills Acquired</span>
                    <strong>{course.outcomes || 'N/A'}</strong>
                  </div>
                </div>

                {/* Structured Syllabus Modules List */}
                {course.syllabusModules && course.syllabusModules.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Syllabus Curriculum Modules ({course.syllabusModules.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {course.syllabusModules.map((mod, idx) => (
                        <div key={idx} style={{
                          backgroundColor: '#fafbfc',
                          border: '1px dashed #e2e8f0',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem'
                        }}>
                          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>{mod.title}</strong>
                          <span style={{ color: '#64748b', lineHeight: 1.4 }}>{mod.topics}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
