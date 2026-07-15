'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Tab State: 'home', 'courses', 'calculator', 'about', 'contact'
  const [activeTab, setActiveTab] = useState('home');

  // Search & Calculator & Verification states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalcCourses, setSelectedCalcCourses] = useState({});
  const [verifyCertId, setVerifyCertId] = useState('');
  const [expandedSyllabusCourseId, setExpandedSyllabusCourseId] = useState(null);

  // Fetch courses and session data client-side
  const loadData = async () => {
    try {
      // Fetch public courses
      const courseRes = await fetch('/api/admin/courses');
      const courseData = await courseRes.json();
      if (courseRes.ok) {
        setCourses(courseData.courses);
      }

      // Fetch active session
      const sessionRes = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      if (sessionRes.ok && sessionData.user) {
        setSession(sessionData.user);
      }
    } catch (err) {
      console.error('Error fetching home page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter courses by search query
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.abbreviation && course.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculator Logic
  const handleCalcCheckboxChange = (courseId) => {
    setSelectedCalcCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Calculate cumulative totals for the estimator
  const selectedList = courses.filter((c) => selectedCalcCourses[c._id]);
  const totalOriginalFees = selectedList.reduce((sum, c) => sum + (c.fees || 0), 0);
  const discountRate = selectedList.length > 1 ? 0.15 : 0; // 15% discount for multiple courses
  const calculatedDiscount = totalOriginalFees * discountRate;
  const netFees = totalOriginalFees - calculatedDiscount;
  const totalMonths = selectedList.reduce((sum, c) => {
    const val = parseInt(c.duration);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleVerifyCertificate = (e) => {
    e.preventDefault();
    if (!verifyCertId.trim()) return;
    window.open(`/certificate/${verifyCertId.trim()}`, '_blank');
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0); // scroll to top on tab transition
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Header Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => handleTabChange('home')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="45" width="150" height="100" rx="10" stroke="#0054a6" strokeWidth="12" fill="white" />
              <rect x="80" y="145" width="40" height="25" fill="#0054a6" />
              <path d="M50 170 H150" stroke="#0054a6" strokeWidth="12" strokeLinecap="round" />
              <path d="M20 100 C 60 70, 140 130, 180 100" stroke="#ff6b12" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M20 115 C 60 85, 140 145, 180 115" stroke="#0054a6" strokeWidth="8" strokeLinecap="round" fill="none" />
              <polygon points="90,75 120,95 90,115" fill="#ff6b12" />
            </svg>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0054a6', fontFamily: 'var(--font-primary)', letterSpacing: '-0.5px' }}>
                Info<span style={{ color: '#ff6b12' }}>Wave</span>
              </span>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', marginTop: '-3px' }}>
                COMPUTER TRAINING CENTER
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <button
              onClick={() => handleTabChange('home')}
              style={{ fontWeight: 700, color: activeTab === 'home' ? '#0054a6' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Welcome Desk
            </button>
            <button
              onClick={() => handleTabChange('courses')}
              style={{ fontWeight: 700, color: activeTab === 'courses' ? '#0054a6' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Course Catalogue
            </button>
            <button
              onClick={() => handleTabChange('calculator')}
              style={{ fontWeight: 700, color: activeTab === 'calculator' ? '#0054a6' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Fee Calculator
            </button>
            <button
              onClick={() => handleTabChange('about')}
              style={{ fontWeight: 700, color: activeTab === 'about' ? '#0054a6' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              About Institute
            </button>
            <button
              onClick={() => handleTabChange('contact')}
              style={{ fontWeight: 700, color: activeTab === 'contact' ? '#0054a6' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Verification & Contact
            </button>

            {session ? (
              <Link href={session.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* PORTAL MAIN CONTENT */}
      <main style={{ flexGrow: 1 }}>

        {/* TAB 1: WELCOME DESK (HOME) */}
        {activeTab === 'home' && (
          <div className="fade-in">
            {/* Hero Section */}
            <section style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              color: 'white',
              padding: '6rem 0 7rem 0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(255,107,18,0.12) 0%, transparent 60%)',
                borderRadius: '50%'
              }} />

              <div className="container" style={{
                position: 'relative',
                zIndex: 10,
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '4rem',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{
                    backgroundColor: 'rgba(255,107,18,0.15)',
                    color: '#ff6b12',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,107,18,0.3)',
                    display: 'inline-block',
                    marginBottom: '1.5rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    Now Admitting for New Batches
                  </span>
                  <h1 style={{
                    fontSize: '3.6rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: '1.5rem',
                    letterSpacing: '-1px'
                  }}>
                    Empowering Ravikamatham Mandal with <span style={{ color: '#ff6b12' }}>Practical IT Skills</span>
                  </h1>
                  <p style={{
                    fontSize: '1.15rem',
                    color: '#cbd5e1',
                    marginBottom: '2.5rem',
                    lineHeight: 1.6,
                    maxWidth: '620px'
                  }}>
                    Gain digital excellence in computer applications, professional ledger bookkeeping, and design layouts. InfoWave provides dedicated workstations, flexible schedules, and verified graduation credentials.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => handleTabChange('courses')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                      Browse Course Catalog
                    </button>
                    <button onClick={() => handleTabChange('about')} className="btn btn-outline" style={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.4)',
                      padding: '0.85rem 2rem',
                      fontSize: '0.95rem',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}>
                      Explore Facilities
                    </button>
                  </div>
                </div>

                {/* Institute Quick Facts Box */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2.25rem',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff6b12', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quick Information Hub
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Managing Proprietor</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginTop: '0.1rem' }}>Gummudu Srinivasarao</div>
                    </div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Proprietor Hotline</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginTop: '0.1rem' }}>+91 9502995059</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Office Location</span>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: 1.4 }}>
                        Near Post Office, Kothakota Village,<br />
                        Ravikamatham Mandal, Anakapalli District,<br />
                        Andhra Pradesh - 531114
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Stats dashboard */}
            <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '2.5rem 0' }}>
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                  {[
                    { value: '1-on-1 PC', label: 'Dedicated Workstations' },
                    { value: '9 Seeded', label: 'Vocational Programs' },
                    { value: '100% Practical', label: 'Lab-driven Curriculum' }
                  ].map((stat, idx) => (
                    <div key={idx} style={{ padding: '0.5rem' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0054a6' }}>{stat.value}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Why InfoWave Highlight Cards */}
            <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                  <span style={{ color: '#0054a6', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Built for local student success
                  </span>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                    Why Choose InfoWave Computer Training?
                  </h2>
                </div>

                <div className="grid-cols-3">
                  {[
                    {
                      icon: '💻',
                      title: '1-on-1 PC Workspace',
                      desc: 'We enforce a strict one-student-per-computer rule during practice sessions. You never have to share screens or wait to try practical labs.'
                    },
                    {
                      icon: '🕒',
                      title: 'Flexible Class Slots',
                      desc: 'Our lab remains operational from 8:00 AM to 8:00 PM, Monday through Saturday. Choose slot schedules that easily align with your school or job.'
                    },
                    {
                      icon: '🛡️',
                      title: 'Secure Online Verification',
                      desc: 'All completion certificates carry unique verification hashes. Employers can verify student credentials online instantly from any location.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="card" style={{ backgroundColor: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Popular Courses Quick Peek */}
            <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#ff6b12', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Hot Picks</span>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>Featured Training Programs</h2>
                  </div>
                  <button onClick={() => handleTabChange('courses')} className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                    View All 9 Courses →
                  </button>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading featured catalog...</div>
                ) : (
                  <div className="grid-cols-3">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course._id} className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.75rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <span style={{
                            backgroundColor: '#e6f0fa',
                            color: '#0054a6',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.75rem'
                          }}>
                            {course.duration}
                          </span>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{course.title}</h3>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>{course.description}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Tuition</span>
                            <span style={{ fontWeight: 800, color: '#ff6b12', fontSize: '1.1rem' }}>₹{course.fees?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                          <button onClick={() => handleTabChange('courses')} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px' }}>
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Testimonials section */}
            <section style={{ padding: '5rem 0', backgroundColor: '#fafbfc', borderTop: '1px solid #e2e8f0' }}>
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                  <span style={{ color: '#0054a6', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>SUCCESS STORY SHOWCASE</span>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>Alumni Testimonials</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="card" style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "InfoWave Center in Kothakota completely transformed my career. The DCA syllabus was very practical. I had my own computer for the full 2 hours slot daily. The verified certificate ID helped me secure a billing executive position in Anakapalli."
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0054a6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>R</div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Ramana Prasad</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>DCA Graduate • Accounts Executive</span>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "I enrolled in Tally Prime course with GST module. Proprietor Gummudu Srinivasarao explained the concepts clearly. The calculator tool on the homepage helped me compare pricing options easily. Highly recommend this training center!"
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff6b12', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>K</div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Kalyani Devi</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tally GST Graduate • Local Store Proprietor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: COURSE CATALOGUE */}
        {activeTab === 'courses' && (
          <div className="fade-in" style={{ padding: '4rem 0' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800 }}>Course Catalogue browser</h1>
                <p style={{ color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 1.5rem auto', fontSize: '1rem', lineHeight: 1.5 }}>
                  Configure your educational roadmap. Search through our catalog and click any course card to inspect its training curriculum.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search courses by title, code or descriptions..."
                    className="form-input"
                    style={{ width: '100%', maxWidth: '500px', padding: '0.8rem 1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>Loading catalogue records...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b', backgroundColor: 'white' }}>
                  No courses match your filter. Check spelling or try a different term.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {filteredCourses.map((course) => (
                    <div key={course._id} className="card" style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      padding: '2rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <span style={{
                              backgroundColor: '#e6f0fa',
                              color: '#0054a6',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px'
                            }}>
                              {course.abbreviation || 'COMP'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Duration: {course.duration}</span>
                          </div>

                          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>{course.title}</h2>
                          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5, maxWidth: '750px' }}>
                            {course.description}
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', maxWidth: '500px', fontSize: '0.85rem', color: '#475569' }}>
                            <div>🛡️ Eligibility: <strong>{course.eligibility || 'Open to all'}</strong></div>
                            <div>🚀 Batch Mode: <strong>{course.batchMode || 'Daily Classes'}</strong></div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Tuition Cost</span>
                            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ff6b12' }}>₹{course.fees?.toLocaleString('en-IN') || '0'}</span>
                          </div>

                          <Link href={`/login?enrollCourseId=${course._id}`} className="btn btn-primary" style={{ padding: '0.55rem', fontSize: '0.85rem', textAlign: 'center', width: '100%' }}>
                            Sign In to Enroll
                          </Link>
                        </div>
                      </div>

                      {/* Course Curriculum modules expansion drop-down */}
                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1rem' }}>
                        <button
                          onClick={() => setExpandedSyllabusCourseId(expandedSyllabusCourseId === course._id ? null : course._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0054a6',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {expandedSyllabusCourseId === course._id ? '▲ Hide Training Modules' : '▼ View Detailed Training Modules'}
                        </button>

                        {expandedSyllabusCourseId === course._id && (
                          <div className="fade-in" style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                              Curriculum Syllabus Milestones:
                            </strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 Module 1: Fundamentals of IT & PC Hardware</div>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 Module 2: Keyboarding speed & Word Processors</div>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 Module 3: Spreadsheet Calculations & Formulations</div>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 Module 4: Internet, Emails & Cyber Security Basics</div>
                              <div style={{ fontSize: '0.8rem', color: '#475569' }}>📍 Module 5: Practical Project & Assessment Lab</div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FEE CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="fade-in" style={{ padding: '4rem 0' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <span style={{ color: '#ff6b12', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Bundle Pricing Estimator
                </span>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, marginTop: '0.2rem' }}>
                  Interactive Multi-Course Calculator
                </h1>
                <p style={{ color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
                  Select multiple courses to calculate combined tuition fees, estimated study durations, and claim a <strong>15% multi-enrollment package discount!</strong>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>

                {/* Checkbox grid selector */}
                <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    Select Course Combinations:
                  </h3>

                  {loading ? (
                    <div>Loading estimator tools...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {courses.map((course) => (
                        <label
                          key={course._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: selectedCalcCourses[course._id] ? '#f0f7ff' : 'white',
                            border: selectedCalcCourses[course._id] ? '2px solid #0054a6' : '1px solid #e2e8f0',
                            padding: '1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              checked={!!selectedCalcCourses[course._id]}
                              onChange={() => handleCalcCheckboxChange(course._id)}
                            />
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>{course.title}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Duration: {course.duration} | Mode: {course.batchMode || 'Daily Class'}</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: 800, color: '#ff6b12' }}>₹{course.fees?.toLocaleString('en-IN') || '0'}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Estimate Result Panel */}
                <div className="card" style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                  color: 'white',
                  padding: '2.5rem',
                  border: 'none',
                  position: 'sticky',
                  top: '100px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                    Syllabus Package Breakdown
                  </h3>

                  {selectedList.length === 0 ? (
                    <div style={{ color: '#cbd5e1', textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' }}>
                      Select one or more courses from the list to compile your custom package discount estimate.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#cbd5e1' }}>Selected Modules:</span>
                        <strong>{selectedList.length} Courses</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: '#cbd5e1' }}>Total Package Duration:</span>
                        <strong>{totalMonths} Months</strong>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#cbd5e1' }}>Standard Combined Cost:</span>
                          <span style={{ textDecoration: selectedList.length > 1 ? 'line-through' : 'none', color: selectedList.length > 1 ? '#cbd5e1' : 'white' }}>
                            ₹{totalOriginalFees.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {selectedList.length > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', marginBottom: '0.5rem' }}>
                            <span>15% Combined Enrollment Discount:</span>
                            <span>- ₹{calculatedDiscount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      <div style={{
                        borderTop: '2px solid rgba(255,255,255,0.2)',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>Net Bundle Tuition Cost:</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff6b12' }}>
                          ₹{netFees.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Link href={`/login?enrollCourseId=${selectedList.map(c => c._id).join(',')}`} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', textAlign: 'center' }}>
                        Sign In to Enroll Now
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT INSTITUTE */}
        {activeTab === 'about' && (
          <div className="fade-in" style={{ padding: '4rem 0' }}>
            <div className="container">

              {/* Profile Heritage intro */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                <div style={{
                  backgroundColor: '#0054a6',
                  borderRadius: '20px',
                  padding: '3rem',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(0,84,166,0.12)'
                }}>
                  <span style={{ color: '#ff6b12', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Welcome to InfoWave
                  </span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem' }}>
                    InfoWave Computer Training Center
                  </h2>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#e6f0fa', marginBottom: '1.5rem' }}>
                    Founded with the dedicated goal of raising computer literacy in Kothakota and surrounding mandals. Under the administration of director Gummudu Srinivasarao, the institute provides local students with the technical confidence required to enter modern workplaces.
                  </p>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>📍 Near Post Office, Kothakota, Ravikamatham Mandal</div>
                    <div>📞 Cell Hotline: +91 9502995059</div>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#0054a6', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    State-of-the-Art Classroom
                  </span>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                    Interactive Lab Facilities
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Our computer classroom is fully optimized to provide hands-on experiences. We believe that technology cannot be learned from textbooks alone; it requires deep practice.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                      <div>
                        <strong>Dedicated Desktop workstations:</strong>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>Each student gets a personal PC screen. Absolutely no screen sharing during slots.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                      <div>
                        <strong>Uninterrupted Power Backup:</strong>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>Equipped with a power generator setup to handle electricity cuts seamlessly, keeping study sessions online.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                      <div>
                        <strong>Flexible Practice Timing Slots:</strong>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>Open daily from 8:00 AM to 8:00 PM. Book slot timings according to your personal availability.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training features grids */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '2.5rem' }}>
                  Educational Delivery Principles
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  <div className="card" style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>📖 Corporate Curriculum</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      Syllabus models (such as Tally Prime ledger books, speed typing keys, and desktop layouts) map directly to skills requested by regional job providers.
                    </p>
                  </div>
                  <div className="card" style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>🔍 Individual Mentoring</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      Proprietor Gummudu Srinivasarao provides personal supervision to ensure students grasp accounting ledgers and document automation codes.
                    </p>
                  </div>
                  <div className="card" style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>📜 Verified Credentials</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      Completed courses earn unique online verification hashes. Employers can search these codes dynamically to verify graduation credentials instantly.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: DYNAMIC VERIFICATION & CONTACT */}
        {activeTab === 'contact' && (
          <div className="fade-in" style={{ padding: '4rem 0' }}>
            <div className="container">

              <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '4rem', alignItems: 'start' }}>

                {/* Contact Coordinates */}
                <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                    Postal Address & Hotlines
                  </h2>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Managing Director</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Gummudu Srinivasarao</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Hotline Phone & WhatsApp</span>
                    <strong style={{ fontSize: '1.3rem', color: '#0054a6' }}>+91 9502995059</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Mailing Location</span>
                    <p style={{ fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.5, marginTop: '0.25rem' }}>
                      Near Post Office,<br />
                      Kothakota Village,<br />
                      Ravikamatham Mandal,<br />
                      Anakapalli District,<br />
                      Andhra Pradesh, India - 531114.
                    </p>
                  </div>
                </div>

                {/* Certificate Verification Gateway widget */}
                <div className="card" style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
                  <div style={{ fontSize: '2.25rem' }}>🛡️</div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                    Online Credentials Registry
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                    Verify student qualifications instantly. Enter the unique Certificate ID (printed at the bottom of the graduation certificate) to view the verified PDF award ledger.
                  </p>

                  <form onSubmit={handleVerifyCertificate} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. IW-CERT-20260715-0GLD"
                      className="form-input"
                      style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '10px' }}
                      value={verifyCertId}
                      onChange={(e) => setVerifyCertId(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                      Verify hash
                    </button>
                  </form>

                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', display: 'block' }}>
                    Note: Verification hashes are generated instantly by the administrator upon student graduation approval.
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0b132b',
        color: 'white',
        padding: '4rem 0 2rem 0',
        borderTop: '1px solid #1c2541',
        marginTop: 'auto'
      }}>
        <div className="container">

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1c2541',
            paddingBottom: '2.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-primary)' }}>
                Info<span style={{ color: '#ff6b12' }}>Wave</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginTop: '0.1rem', letterSpacing: '0.5px' }}>
                COMPUTER TRAINING CENTER
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.9rem' }}>
              <button onClick={() => handleTabChange('courses')} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Courses</button>
              <button onClick={() => handleTabChange('calculator')} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Calculator</button>
              <button onClick={() => handleTabChange('about')} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>About Us</button>
              <Link href="/login" style={{ color: '#94a3b8' }}>Student Portal</Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.8rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© {new Date().getFullYear()} InfoWave Computer Training Center. All rights reserved.</span>
            <span>Director: Gummudu Srinivasarao | Phone: +91 9502995059 | Kothakota Village, Ravikamatham Mandal</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
