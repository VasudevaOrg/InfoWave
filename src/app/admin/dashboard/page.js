import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Link from 'next/link';

async function getStats() {
  try {
    await connectDB();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const activeEnrollments = totalEnrollments - completedEnrollments;

    // Fetch recent 5 enrollments
    const recentEnrollments = await Enrollment.find()
      .populate('studentId')
      .populate('courseId')
      .sort({ enrolledAt: -1 })
      .limit(5);

    // Compute course distribution share for analytical graph
    const enrollments = await Enrollment.find().populate('courseId');
    const courseStatsMap = {};
    enrollments.forEach((e) => {
      if (e.courseId) {
        const title = e.courseId.title.split(' ')[0]; // Use short abbreviation e.g. "DCA"
        courseStatsMap[title] = (courseStatsMap[title] || 0) + 1;
      }
    });

    const courseDistribution = Object.entries(courseStatsMap)
      .map(([name, value]) => ({ name, students: value }))
      .sort((a, b) => b.students - a.students);

    return {
      totalStudents,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      recentEnrollments: JSON.parse(JSON.stringify(recentEnrollments)),
      courseDistribution,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
      activeEnrollments: 0,
      recentEnrollments: [],
      courseDistribution: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, labelAbbr: 'ST', color: '#0054a6', bg: '#e6f0fa' },
    { label: 'Courses Offered', value: stats.totalCourses, labelAbbr: 'CO', color: '#ff6b12', bg: '#fff0e6' },
    { label: 'Active Students', value: stats.activeEnrollments, labelAbbr: 'AC', color: '#10b981', bg: '#e6fdf5' },
    { label: 'Completed Courses', value: stats.completedEnrollments, labelAbbr: 'CM', color: '#eab308', bg: '#fef3c7' }
  ];

  // Find max student count in courses to set relative chart widths
  const maxStudents = stats.courseDistribution.reduce((max, c) => c.students > max ? c.students : max, 1);

  return (
    <div className="fade-in">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time training center enrollment statistics and metrics.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        {cards.map((card, idx) => (
          <div key={idx} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white'
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: card.color,
              backgroundColor: card.bg,
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {card.labelAbbr}
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.label}
              </span>
              <h2 style={{ fontSize: '2.0rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Recent Activity Table */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Recent Enrollments
          </h3>
          {stats.recentEnrollments.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0' }}>
              No enrollments registered yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Student</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Course</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEnrollments.map((enr) => (
                    <tr key={enr._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          {enr.studentId?.name || 'Deleted Student'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {enr.studentId?.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                        {enr.courseId?.title || 'Deleted Course'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{
                          backgroundColor: enr.status === 'completed' ? '#e6fdf5' : '#e6f0fa',
                          color: enr.status === 'completed' ? '#10b981' : '#0054a6',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          textTransform: 'capitalize'
                        }}>
                          {enr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Analytics Distribution Graph (CSS Chart) */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Course Share Analytics
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Visual distribution of registered student shares.
          </p>

          {stats.courseDistribution.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 0' }}>
              No enrollments registered to compile analytics.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {stats.courseDistribution.map((course, index) => {
                const widthPercent = (course.students / maxStudents) * 100;
                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                      <span>{course.name}</span>
                      <span>{course.students} Student(s)</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        backgroundColor: index % 2 === 0 ? '#0054a6' : '#ff6b12',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick Links Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Quick Management Links
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/admin/courses" className="btn btn-outline" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
              ➕ Manage Course Catalog
            </Link>
            <Link href="/admin/students" className="btn btn-outline" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem', borderColor: '#ff6b12', color: '#ff6b12' }}>
              🎓 Manage Student Progress
            </Link>
            <Link href="/admin/profile" className="btn btn-ghost" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
              🏢 Office Address Settings
            </Link>
          </div>
        </div>

        <div className="card" style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #0054a6 0%, #003d7a 100%)',
          color: 'white',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            InfoWave Portal
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#e6f0fa', lineHeight: 1.4 }}>
            Direct database access is active. Data changes reflect live on the landing page catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
