'use client';

import { useState, useEffect } from 'react';

export default function AdminProfilePage() {
  const [profileForm, setProfileForm] = useState({
    name: '',
    cellNo: '',
    altCellNo: '',
    address: '',
    profileImage: '',
    password: '',
    institutionName: '',
    registrationNo: '',
    establishedYear: '',
    gstNo: '',
    websiteUrl: '',
    district: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setProfileForm({
          name: data.user.name || '',
          cellNo: data.user.cellNo || '',
          altCellNo: data.user.altCellNo || '',
          address: data.user.address || '',
          profileImage: data.user.profileImage || '',
          password: '', // Keep blank unless changing
          institutionName: data.user.institutionName || '',
          registrationNo: data.user.registrationNo || '',
          establishedYear: data.user.establishedYear || '',
          gstNo: data.user.gstNo || '',
          websiteUrl: data.user.websiteUrl || '',
          district: data.user.district || '',
          state: data.user.state || '',
          pincode: data.user.pincode || '',
        });
      } else {
        setError(data.error || 'Failed to fetch profile details');
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
      const res = await fetch('/api/admin/profile', {
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

      setSuccess('Institution profile updated successfully!');
      
      // Clean password field
      setProfileForm(prev => ({ ...prev, password: '' }));
      
      // Reload profile
      fetchProfile();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Institution Profile Settings</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Configure director details, institutional license registries, and contact addresses.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          Loading profile parameters...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Logo & Status Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Logo Avatar card */}
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
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administrator</span>
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
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
          </div>

          {/* Right Column: Editable Settings Dossier */}
          <div className="card" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '2rem' }}>
            
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* SECTION 1: Proprietor Details */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Proprietor / Director Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Proprietor Full Name *</label>
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
                    <label className="form-label" htmlFor="cellNo">Primary Phone *</label>
                    <input
                      id="cellNo"
                      name="cellNo"
                      type="tel"
                      className="form-input"
                      value={profileForm.cellNo}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="altCellNo">Alternate Phone</label>
                    <input
                      id="altCellNo"
                      name="altCellNo"
                      type="tel"
                      className="form-input"
                      value={profileForm.altCellNo}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Institution Details */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Institution Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="institutionName">Institution Name</label>
                    <input
                      id="institutionName"
                      name="institutionName"
                      type="text"
                      placeholder="e.g. InfoWave Computer Training Center"
                      className="form-input"
                      value={profileForm.institutionName}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="registrationNo">License / Reg Number</label>
                    <input
                      id="registrationNo"
                      name="registrationNo"
                      type="text"
                      placeholder="e.g. REG-2026-9502"
                      className="form-input"
                      value={profileForm.registrationNo}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="establishedYear">Established Year</label>
                    <input
                      id="establishedYear"
                      name="establishedYear"
                      type="text"
                      placeholder="e.g. 2018"
                      className="form-input"
                      value={profileForm.establishedYear}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="gstNo">GSTIN / Tax No</label>
                    <input
                      id="gstNo"
                      name="gstNo"
                      type="text"
                      placeholder="e.g. 37AAAAA0000A1Z"
                      className="form-input"
                      value={profileForm.gstNo}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="websiteUrl">Official Website</label>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      placeholder="e.g. https://infowave.com"
                      className="form-input"
                      value={profileForm.websiteUrl}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="address">Permanent Location Address</label>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    className="form-input"
                    style={{ resize: 'none' }}
                    value={profileForm.address}
                    onChange={handleInputChange}
                    placeholder="Near Post Office, Kothakota Village..."
                    disabled={submitting}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="district">District</label>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      placeholder="Anakapalli"
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
                      placeholder="Andhra Pradesh"
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
                      placeholder="531114"
                      className="form-input"
                      value={profileForm.pincode}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Credentials */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Security Settings
                </h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Change Administrator Password (Leave empty to keep current)</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    placeholder="Enter new administrator password"
                    value={profileForm.password}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 2rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving settings...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}
    </div>
  );
}
