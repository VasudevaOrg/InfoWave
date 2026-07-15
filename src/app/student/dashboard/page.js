import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getDashboardData(studentId) {
  try {
    await connectDB();
    const enrollments = await Enrollment.find({ studentId })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    const activeCourses = enrollments.filter((e) => e.status === 'active');
    const completedCourses = enrollments.filter((e) => e.status === 'completed');
    const pendingCourses = enrollments.filter((e) => e.status === 'pending');

    const enrolledCourseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
    const suggestions = await Course.find({
      _id: { $nin: enrolledCourseIds },
    })
      .limit(3)
      .sort({ createdAt: -1 });

    return {
      activeCourses: JSON.parse(JSON.stringify(activeCourses)),
      completedCourses: JSON.parse(JSON.stringify(completedCourses)),
      pendingCourses: JSON.parse(JSON.stringify(pendingCourses)),
      suggestions: JSON.parse(JSON.stringify(suggestions)),
    };
  } catch (error) {
    console.error('Error loading student dashboard data:', error);
    return { activeCourses: [], completedCourses: [], pendingCourses: [], suggestions: [] };
  }
}

export default async function StudentDashboardPage() {
  const session = await verifyAuth('student');
  if (!session) {
    redirect('/login');
  }

  const { activeCourses, completedCourses, pendingCourses, suggestions } = await getDashboardData(session.id);

  // Group completed courses by certificate status for banners
  const unrequestedCerts = completedCourses.filter(e => e.certificateRequestStatus === 'none' || !e.certificateRequestStatus);
  const pendingCerts = completedCourses.filter(e => e.certificateRequestStatus === 'requested');
  const approvedCerts = completedCourses.filter(e => e.certificateRequestStatus === 'approved');

  return (
    <div className="fade-in">
      {/* Title Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Welcome, {session.name}</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Monitor your study progress, syllabus milestones, and check credential badge releases.
        </p>
      </div>

      {/* Banner 1: Unrequested Certificates */}
      {unrequestedCerts.length > 0 && (
        <div style={{
          backgroundColor: '#e0f2fe',
          border: '1px solid #bae6fd',
          color: '#0369a1',
          padding: '1.25rem 2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1' }}>Course Completed - Request Certificate</h3>
            <p style={{ fontSize: '0.85rem', color: '#0284c7', marginTop: '0.15rem' }}>
              You have completed {unrequestedCerts.map(c => c.courseId?.title).join(', ')}. Submit a certificate request to the admin to release your verified PDF.
            </p>
          </div>
          <Link href="/student/certificates" className="btn btn-primary" style={{
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem'
          }}>
            Request Certificate
          </Link>
        </div>
      )}

      {/* Banner 2: Pending Certificate Requests */}
      {pendingCerts.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#b45309',
          padding: '1.25rem 2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>Certificate Request Pending</h3>
            <p style={{ fontSize: '0.85rem', color: '#d97706', marginTop: '0.15rem' }}>
              Your certificate request for {pendingCerts.map(c => c.courseId?.title).join(', ')} is in queue. The admin will verify and issue it shortly.
            </p>
          </div>
          <Link href="/student/certificates" className="btn btn-outline" style={{
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            color: '#d97706',
            borderColor: '#fde68a'
          }}>
            Check Status
          </Link>
        </div>
      )}

      {/* Banner 3: Approved Certificates */}
      {approvedCerts.length > 0 && (
        <div style={{
          backgroundColor: '#e6fdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1.25rem 2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>Verified Certificates Issued</h3>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.15rem' }}>
              Your certificate for {approvedCerts.map(c => c.courseId?.title).join(', ')} is approved and ready.
            </p>
          </div>
          <Link href="/student/certificates" className="btn" style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800
          }}>
            Download PDF Certificate
          </Link>
        </div>
      )}

      {/* Grid container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2.5rem' }}>
        
        {/* Left column: Active studies & Pending requests */}
        <div>
          
          {/* Section 1: Active Courses */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Active Courses ({activeCourses.length})
          </h2>

          {activeCourses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', marginBottom: '2.5rem' }}>
              No active course enrollments found. Find a course in our catalog.
              <div style={{ marginTop: '1.5rem' }}>
                <Link href="/student/catalog" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Browse Course Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {activeCourses.map((enr) => (
                <div key={enr._id} className="card" style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  padding: '1.75rem'
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{enr.courseId?.title}</h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Enrolled On: {new Date(enr.enrolledAt).toLocaleDateString()} | Duration: {enr.courseId?.duration}
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: '#e6f0fa',
                      color: '#0054a6',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      Study In Progress
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {enr.courseId?.description}
                  </p>

                  {/* Syllabus milestone tracker */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Syllabus Milestones:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        <span>[x]</span>
                        <span>Module 1: Fundamentals</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        <span>[x]</span>
                        <span>Module 2: Practical Lab Work</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>[-]</span>
                        <span>Module 3: Project Assignment</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>[-]</span>
                        <span>Module 4: Final Assessment</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                      <span>Syllabus Progress</span>
                      <span>50%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '50%', height: '100%', backgroundColor: '#0054a6', borderRadius: '4px' }} />
                    </div>
                    
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.75rem', fontStyle: 'italic' }}>
                      Complete final tasks inside your local systems lab. Once completed, the instructor (G. Srinivasarao) will mark this course as completed to release your verification hash.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 2: Pending Course Requests */}
          {pendingCourses.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                Pending Course Requests ({pendingCourses.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingCourses.map((enr) => (
                  <div key={enr._id} className="card" style={{
                    backgroundColor: '#fafbfc',
                    border: '1px dashed #cbd5e1',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{enr.courseId?.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Requested: {new Date(enr.enrolledAt).toLocaleDateString()} | Duration: {enr.courseId?.duration}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'block', marginTop: '0.4rem', fontWeight: 600 }}>
                        Please complete offline payment verification with Gummudu Srinivasarao (+91 9502995059).
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #fde68a'
                    }}>
                      Awaiting Approval
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Guides & recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Lab Desk schedule widget */}
          <div className="card" style={{
            backgroundColor: '#0a3d62',
            color: 'white',
            padding: '2rem',
            border: 'none'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
              Lab Practice Slots
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#d2e9f9', lineHeight: 1.4, marginBottom: '1.25rem' }}>
              The computer lab is open for student practice runs:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
                <span>Mon - Sat:</span>
                <strong>8:00 AM - 8:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span>Sunday:</span>
                <span style={{ color: '#ff6b12', fontWeight: 800 }}>Closed</span>
              </div>
            </div>
          </div>

          {/* Dynamic recommendations */}
          <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Suggestions For You
            </h3>

            {suggestions.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
                You have already enrolled in all available courses!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {suggestions.map((course) => (
                  <div key={course._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{course.title}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      <span>Syllabus: {course.duration}</span>
                      <span style={{ color: '#ff6b12', fontWeight: 700 }}>₹{course.fees?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    <Link href="/student/catalog" className="btn btn-outline" style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', textAlign: 'center' }}>
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
