'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterStudentPage() {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const router = useRouter();

  // Expanded student registration form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cellNo: '',
    altCellNo: '',
    dob: '',
    gender: '',
    qualification: '', // Summary statement
    status: '',
    schoolCollege: '',
    address: '',
    district: '',
    state: 'Andhra Pradesh', // default state
    pincode: '',
    admissionNo: '',
    bloodGroup: '',
    modeOfTraining: 'Daily Class', // default training mode
    initialCourseId: '',
    profileImage: ''
  });

  // Dynamic multi-row qualifications checklist
  const [academicHistory, setAcademicHistory] = useState([
    { qualification: '10th Class', institution: '', passingYear: '', percentage: '' }
  ]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch course list for initial enrollment dropdown selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/admin/courses');
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load courses for dropdown:', err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle dynamic academic rows
  const handleAddAcademic = () => {
    setAcademicHistory((prev) => [
      ...prev,
      { qualification: '', institution: '', passingYear: '', percentage: '' }
    ]);
  };

  const handleRemoveAcademic = (index) => {
    setAcademicHistory((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAcademicChange = (index, field, value) => {
    setAcademicHistory((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  // Handle file reader upload to Base64 image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile photo size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
          action: 'create',
          ...form,
          academicHistory // Submit the array
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student profile');
      }

      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0.5rem 1rem' }}>
      
      {/* Breadcrumbs Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        <Link href="/admin/students" style={{ color: '#0054a6', fontWeight: 600 }}>Student Records</Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>Add Student Profile</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Add New Student Profile</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Register comprehensive contact, academic, and course admission details for the student.
          </p>
        </div>
        <Link href="/admin/students" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
          ← Back to List
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
        
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <span>👤</span> Personal Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Rahul Kumar"
                className="form-input"
                value={form.name}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-input"
                value={form.gender}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                className="form-input"
                value={form.dob}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="admissionNo">Admission/Roll No</label>
              <input
                id="admissionNo"
                name="admissionNo"
                type="text"
                placeholder="e.g. INF-2026-0045"
                className="form-input"
                value={form.admissionNo}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                className="form-input"
                value={form.bloodGroup}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="">-- Select Blood Group --</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.85rem' }}
                  disabled={submitting}
                />
                {form.profileImage && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundImage: `url(${form.profileImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #cbd5e1'
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS & CONTACT INFORMATION */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <span>📞</span> Credentials, Address & Contacts
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Login Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                className="form-input"
                value={form.email}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Assign Login Password *</label>
              <input
                id="password"
                name="password"
                type="text"
                placeholder="Assign a password (e.g. student123)"
                className="form-input"
                value={form.password}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cellNo">Primary Cell/Mobile No</label>
              <input
                id="cellNo"
                name="cellNo"
                type="tel"
                placeholder="Primary mobile (10 digits)"
                className="form-input"
                value={form.cellNo}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="altCellNo">Parent / Guardian Cell No</label>
              <input
                id="altCellNo"
                name="altCellNo"
                type="tel"
                placeholder="Alternate phone number"
                className="form-input"
                value={form.altCellNo}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" htmlFor="address">Permanent Address</label>
            <textarea
              id="address"
              name="address"
              placeholder="House no, Street name, Village/Mandal details..."
              rows="2"
              style={{ resize: 'none' }}
              className="form-input"
              value={form.address}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="district">District</label>
              <input
                id="district"
                name="district"
                type="text"
                placeholder="e.g. Anakapalli"
                className="form-input"
                value={form.district}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="e.g. Andhra Pradesh"
                className="form-input"
                value={form.state}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                placeholder="6-digit pincode"
                className="form-input"
                value={form.pincode}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: EDUCATIONAL HISTORY (DYNAMIC ROW MAKER) */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span>🏫</span> Academic Background (Qualifications)
            </h3>
            <button
              type="button"
              onClick={handleAddAcademic}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderColor: '#10b981', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>➕</span> Add Qualification
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Current Student Status</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={form.status}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="">-- Select Status --</option>
                <option value="Student">Student (School/College)</option>
                <option value="Job Seeker">Job Seeker</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Self Employed">Self Employed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="qualification">Summary Remarks / Comments</label>
              <input
                id="qualification"
                name="qualification"
                type="text"
                placeholder="e.g. Completed intermediate, seeking digital literacy skills..."
                className="form-input"
                value={form.qualification}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Dynamic Qualifications rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {academicHistory.map((acad, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 0.8fr 0.8fr 50px',
                gap: '1rem',
                alignItems: 'end',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. 10th / Inter / B.Sc"
                    className="form-input"
                    value={acad.qualification}
                    onChange={(e) => handleAcademicChange(idx, 'qualification', e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>School / College / Board</label>
                  <input
                    type="text"
                    placeholder="e.g. ZP High School, Kothakota"
                    className="form-input"
                    value={acad.institution}
                    onChange={(e) => handleAcademicChange(idx, 'institution', e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Passing Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2022"
                    className="form-input"
                    value={acad.passingYear}
                    onChange={(e) => handleAcademicChange(idx, 'passingYear', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Grade / %</label>
                  <input
                    type="text"
                    placeholder="e.g. 88% or 8.5"
                    className="form-input"
                    value={acad.percentage}
                    onChange={(e) => handleAcademicChange(idx, 'percentage', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAcademic(idx)}
                    className="btn"
                    disabled={academicHistory.length === 1 || submitting}
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

        {/* SECTION 4: COURSE ADMISSION */}
        <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <span>🎓</span> Course Enrollment & Mode
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="initialCourseId">Initial Course Admission (Optional)</label>
              {coursesLoading ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading courses dropdown options...</div>
              ) : (
                <select
                  id="initialCourseId"
                  name="initialCourseId"
                  className="form-input"
                  value={form.initialCourseId}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  <option value="">-- No Enrollment Yet (Register Credentials Only) --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} (Duration: {course.duration} | Fee: ₹{course.fees?.toLocaleString('en-IN') || '0'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modeOfTraining">Training Delivery Mode</label>
              <select
                id="modeOfTraining"
                name="modeOfTraining"
                className="form-input"
                value={form.modeOfTraining}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="Daily Class">Daily Lab Class (1-2 Hours)</option>
                <option value="Online">Online Self-Paced</option>
                <option value="Weekend">Weekend Special Batch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', marginBottom: '3rem' }}>
          <Link href="/admin/students" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} disabled={submitting}>
            {submitting ? 'Creating Profile...' : '✓ Save Student Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
