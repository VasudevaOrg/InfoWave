'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CourseFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCourseId = searchParams.get('editCourseId');
  const isEditing = !!editCourseId;

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '',
    fees: '',
    image: '',
    abbreviation: '',
    prerequisites: '',
    outcomes: '',
    batchMode: 'Daily Class',
    keyboardSpeed: '',
    recommendedSoftware: '',
    eligibility: ''
  });

  // Dynamic structured syllabus modules outline
  const [syllabusModules, setSyllabusModules] = useState([
    { title: 'Module 1: Fundamentals', topics: 'Introduction and core system practicals.' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch course details if we are in Edit mode
  useEffect(() => {
    if (isEditing) {
      const fetchCourseDetails = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/admin/courses');
          const data = await res.json();
          if (res.ok) {
            const match = data.courses.find((c) => c._id === editCourseId);
            if (match) {
              setForm({
                title: match.title || '',
                description: match.description || '',
                duration: match.duration || '',
                fees: match.fees || '',
                image: match.image || '',
                abbreviation: match.abbreviation || '',
                prerequisites: match.prerequisites || '',
                outcomes: match.outcomes || '',
                batchMode: match.batchMode || 'Daily Class',
                keyboardSpeed: match.keyboardSpeed || '',
                recommendedSoftware: match.recommendedSoftware || '',
                eligibility: match.eligibility || ''
              });
              if (match.syllabusModules && match.syllabusModules.length > 0) {
                setSyllabusModules(match.syllabusModules);
              }
            } else {
              setError('Requested course details not found in catalog');
            }
          }
        } catch (err) {
          console.error('Error fetching course for editing:', err);
          setError('Failed to fetch course details');
        } finally {
          setLoading(false);
        }
      };
      fetchCourseDetails();
    }
  }, [editCourseId, isEditing]);

  // Image file change encoder
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Course banner image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Syllabus modules outline managers
  const handleAddModule = () => {
    setSyllabusModules((prev) => [
      ...prev,
      { title: `Module ${prev.length + 1}: `, topics: '' }
    ]);
  };

  const handleRemoveModule = (index) => {
    setSyllabusModules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleModuleChange = (index, field, value) => {
    setSyllabusModules((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const endpoint = '/api/admin/courses';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { id: editCourseId, ...form, syllabusModules } : { ...form, syllabusModules };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course record');
      }

      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
        Loading course configuration details...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '0.5rem 1rem' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        <Link href="/admin/courses" style={{ color: '#0054a6', fontWeight: 600 }}>Manage Courses</Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>{isEditing ? 'Edit Course' : 'Create Course'}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>
            {isEditing ? '✏️ Edit Course Details' : '➕ Register New Course Offer'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Setup detailed syllabus curriculum modules, training parameters, tuition fees, and cover images.
          </p>
        </div>
        <Link href="/admin/courses" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
          ← Back to Catalog
        </Link>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          marginBottom: '2rem',
          fontWeight: 600
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECTION 1: CORE COURSE DETAILS */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <span>📚</span> Basic Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Course Title (Full Name) *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. DCA (Diploma in Computer Applications)"
                className="form-input"
                value={form.title}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="abbreviation">Syllabus Abbreviation</label>
              <input
                id="abbreviation"
                name="abbreviation"
                type="text"
                placeholder="e.g. DCA"
                className="form-input"
                value={form.abbreviation}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="duration">Course Duration *</label>
              <input
                id="duration"
                name="duration"
                type="text"
                placeholder="e.g. 3 Months"
                className="form-input"
                value={form.duration}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fees">Tuition Fees (INR) *</label>
              <input
                id="fees"
                name="fees"
                type="number"
                placeholder="e.g. 3500"
                className="form-input"
                value={form.fees}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Card Banner</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.85rem' }}
                  disabled={submitting}
                />
                {form.image && (
                  <div style={{
                    width: '50px',
                    height: '35px',
                    borderRadius: '4px',
                    backgroundImage: form.image.startsWith('linear-gradient') ? form.image : `url(${form.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #cbd5e1'
                  }} />
                )}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="description">Brief Course Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Provide a general summary of the course target outcomes..."
              rows="3"
              style={{ resize: 'none' }}
              className="form-input"
              value={form.description}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />
          </div>
        </div>

        {/* SECTION 2: CURRICULUM SYLLABUS OUTLINE (DYNAMIC TABLE BUILDER) */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span>📖</span> Syllabus Curriculum Modules
            </h3>
            <button
              type="button"
              onClick={handleAddModule}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderColor: '#10b981', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>➕</span> Add Module Row
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {syllabusModules.map((mod, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 2.5fr 50px',
                gap: '1.5rem',
                alignItems: 'end',
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Module Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Module 1: MS Word Tools"
                    className="form-input"
                    value={mod.title}
                    onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Topics Covered</label>
                  <input
                    type="text"
                    placeholder="e.g. Formatted tables, page margins, print alignments, macro records..."
                    className="form-input"
                    value={mod.topics}
                    onChange={(e) => handleModuleChange(idx, 'topics', e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(idx)}
                    className="btn"
                    disabled={syllabusModules.length === 1 || submitting}
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.15)',
                      padding: '0.6rem',
                      width: '100%',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: SYSTEM SPECIFICATIONS & ADMISSIONS */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <span>🛠️</span> Classroom Lab Settings & Prerequisites
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="eligibility">Student Eligibility</label>
              <input
                id="eligibility"
                name="eligibility"
                type="text"
                placeholder="e.g. 10th standard pass / basic literacy"
                className="form-input"
                value={form.eligibility}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="keyboardSpeed">Typing Recommendation</label>
              <input
                id="keyboardSpeed"
                name="keyboardSpeed"
                type="text"
                placeholder="e.g. English speed 25+ WPM"
                className="form-input"
                value={form.keyboardSpeed}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="batchMode">Default Delivery Mode</label>
              <select
                id="batchMode"
                name="batchMode"
                className="form-input"
                value={form.batchMode}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="Daily Class">Daily Lab Class (1-2 Hours)</option>
                <option value="Online">Online Self-Paced</option>
                <option value="Weekend">Weekend Special Batch</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prerequisites">Required Prerequisites</label>
              <input
                id="prerequisites"
                name="prerequisites"
                type="text"
                placeholder="e.g. Basic reading comprehension, typing operations knowledge"
                className="form-input"
                value={form.prerequisites}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recommendedSoftware">Recommended Software</label>
              <input
                id="recommendedSoftware"
                name="recommendedSoftware"
                type="text"
                placeholder="e.g. MS Office 2016, Python 3.9 interpreter, Tally ERP 9"
                className="form-input"
                value={form.recommendedSoftware}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="outcomes">Learning Outcomes & Skills Acquired</label>
            <input
              id="outcomes"
              name="outcomes"
              type="text"
              placeholder="e.g. Professional accounting, financial audits, basic coding logic..."
              className="form-input"
              value={form.outcomes}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', marginBottom: '3rem' }}>
          <Link href="/admin/courses" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} disabled={submitting}>
            {submitting ? 'Saving Course...' : '✓ Save Course Setup'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function ConfigureCoursePage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
        Loading Course Configuration Panel...
      </div>
    }>
      <CourseFormContent />
    </Suspense>
  );
}
