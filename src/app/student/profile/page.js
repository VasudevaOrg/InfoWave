'use client';

import { useState, useEffect } from 'react';

export default function StudentProfilePage() {
  const [profileForm, setProfileForm] = useState({
    name: '',
    cellNo: '',
    altCellNo: '',
    dob: '',
    gender: '',
    qualification: '',
    status: '',
    schoolCollege: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    bloodGroup: '',
    profileImage: '',
    password: '',
  });

  // Admin-controlled read-only fields
  const [admissionNo, setAdmissionNo] = useState('');
  const [modeOfTraining, setModeOfTraining] = useState('');
  const [academicHistory, setAcademicHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch student profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setProfileForm({
          name: data.user.name || '',
          cellNo: data.user.cellNo || '',
          altCellNo: data.user.altCellNo || '',
          dob: data.user.dob || '',
          gender: data.user.gender || '',
          qualification: data.user.qualification || '',
          status: data.user.status || '',
          schoolCollege: data.user.schoolCollege || '',
          address: data.user.address || '',
          district: data.user.district || '',
          state: data.user.state || '',
          pincode: data.user.pincode || '',
          bloodGroup: data.user.bloodGroup || '',
          profileImage: data.user.profileImage || '',
          password: '', // Keep blank unless changing
        });
        setAdmissionNo(data.user.admissionNo || '');
        setModeOfTraining(data.user.modeOfTraining || '');
        setAcademicHistory(data.user.academicHistory || []);
      } else {
        setError(data.error || 'Failed to load profile details');
      }
    } catch (err) {
      console.error('Fetch profile details error:', err);
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile image must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile details updated successfully!');
      setProfileForm(prev => ({ ...prev, password: '' }));
      fetchProfile();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Personal Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your personal details, home address, contact logs, and login passwords.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading profile parameters...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Avatar & Read-Only Institution Record */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Avatar card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                backgroundColor: '#0054a6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 800,
                overflow: 'hidden',
                border: '3px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {profileForm.profileImage ? (
                  <img src={profileForm.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profileForm.name.charAt(0)
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{profileForm.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Profile</span>
              </div>

              <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <label style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  transition: 'var(--transition)'
                }}>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Office Records (Read-Only) */}
            <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                Office Registry
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>Roll Number</span>
                  <strong style={{ color: '#0f172a' }}>{admissionNo || 'Not Assigned'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>Training Mode</span>
                  <strong style={{ color: '#0054a6' }}>{modeOfTraining || 'Daily Class'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Profile Details */}
          <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              My Profile Dossier
            </h3>

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

            {success && (
              <div style={{
                backgroundColor: '#e6fdf5',
                border: '1px solid #a7f3d0',
                color: '#10b981',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                fontWeight: 600
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* SECTION A: Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={profileForm.name}
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
                    value={profileForm.gender}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">Not Registered</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={profileForm.bloodGroup}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">Not Registered</option>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dob">Date of Birth</label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    className="form-input"
                    value={profileForm.dob}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="schoolCollege">School / College / Organization</label>
                  <input
                    id="schoolCollege"
                    name="schoolCollege"
                    placeholder="Not Registered"
                    type="text"
                    className="form-input"
                    value={profileForm.schoolCollege}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* SECTION B: Contact Coordinates */}
              <h4 style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, margin: '1.5rem 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact Details
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cellNo">Primary Mobile Number</label>
                  <input
                    id="cellNo"
                    name="cellNo"
                    type="tel"
                    placeholder="Not Registered"
                    className="form-input"
                    value={profileForm.cellNo}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="altCellNo">Guardian / Parent Contact</label>
                  <input
                    id="altCellNo"
                    name="altCellNo"
                    type="tel"
                    placeholder="Not Registered"
                    className="form-input"
                    value={profileForm.altCellNo}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="address">Permanent Home Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={profileForm.address}
                  onChange={handleInputChange}
                  placeholder="Not Registered"
                  disabled={submitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="district">District</label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    placeholder="Not Registered"
                    className="form-input"
                    value={profileForm.district}
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
                    placeholder="Not Registered"
                    className="form-input"
                    value={profileForm.state}
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
                    placeholder="Not Registered"
                    className="form-input"
                    value={profileForm.pincode}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* SECTION C: Academic Qualifications History (Read-Only) */}
              {academicHistory && academicHistory.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, margin: '1.5rem 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Registered Qualifications History
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {academicHistory.map((acad, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        <span>🎓 <strong>{acad.qualification}</strong> at <em>{acad.institution}</em></span>
                        <span style={{ color: '#64748b' }}>
                          Passed: <strong>{acad.passingYear || 'N/A'}</strong> | Marks/Grade: <strong>{acad.percentage || 'N/A'}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION D: Security Credentials */}
              <div className="form-group" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <label className="form-label" htmlFor="student-pwd">Update Password (Leave empty to keep current)</label>
                <input
                  id="student-pwd"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter new password if you wish to change it"
                  value={profileForm.password}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 2rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving modifications...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
