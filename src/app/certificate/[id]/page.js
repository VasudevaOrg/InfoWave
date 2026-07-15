import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import Course from '@/models/Course';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import PrintButton from './PrintButton';

async function getCertificateData(certificateId) {
  try {
    await connectDB();
    const enrollment = await Enrollment.findOne({ certificateId })
      .populate('studentId')
      .populate('courseId');
    return JSON.parse(JSON.stringify(enrollment));
  } catch (error) {
    console.error('Error fetching certificate data:', error);
    return null;
  }
}

export default async function CertificatePage({ params }) {
  const { id } = await params;
  const enrollment = await getCertificateData(id);

  if (!enrollment) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ef4444' }}>⚠️</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Invalid Certificate Key</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '400px' }}>
          We could not find any active student enrollment matching the certificate ID: <br />
          <code style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem', display: 'inline-block', marginTop: '0.5rem' }}>{id}</code>
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Back to Home Page
        </Link>
      </div>
    );
  }

  const { studentId: student, courseId: course, completedAt, certificateId } = enrollment;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Action controls (Hidden during print) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '850px',
        marginBottom: '1.5rem',
        backgroundColor: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>✓ Verified Certificate</span>
          <h2 style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>ID: {certificateId}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Home Page
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Main Certificate Frame (A4 Landscape aspect ratio) */}
      <div className="certificate-frame" style={{
        width: '100%',
        maxWidth: '850px',
        aspectRatio: '1.414 / 1', // standard A4 aspect ratio
        backgroundColor: '#fdfbf7', // parchment white
        border: '16px double #0054a6', // Royal blue double border
        borderRadius: '4px',
        padding: '3.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Certificate inner boundary line */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: '2px solid #ff6b12', // Orange inner border line
          pointerEvents: 'none'
        }} />

        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderTop: '4px solid #ff6b12', borderLeft: '4px solid #ff6b12' }} />
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderTop: '4px solid #ff6b12', borderRight: '4px solid #ff6b12' }} />
        <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderBottom: '4px solid #ff6b12', borderLeft: '4px solid #ff6b12' }} />
        <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderBottom: '4px solid #ff6b12', borderRight: '4px solid #ff6b12' }} />

        {/* Top Header info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', marginTop: '-3px' }}>
                COMPUTER TRAINING CENTER
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Kothakota, Ravikamatham Mandal, Anakapalli District, A.P. 531114
          </span>
        </div>

        {/* Certificate title body */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '0.75rem 0' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontFamily: 'Georgia, serif',
            color: '#0b132b',
            letterSpacing: '1px',
            fontWeight: 400,
            textTransform: 'uppercase',
            margin: 0
          }}>
            Certificate of Completion
          </h1>
          <div style={{ width: '100px', height: '1px', backgroundColor: '#ff6b12', margin: '0.5rem 0' }} />
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', margin: '0.25rem 0' }}>
            This is to certify that
          </p>
          <h2 style={{
            fontSize: '2.1rem',
            fontFamily: 'Georgia, serif',
            color: '#0054a6',
            fontWeight: 700,
            margin: '0.5rem 0',
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: '0.2rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            {student?.name}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '600px', lineHeight: 1.5, margin: '0.25rem 0' }}>
            has successfully completed the specialized vocational computer training program in
          </p>
          <h3 style={{
            fontSize: '1.3rem',
            color: '#ff6b12',
            fontWeight: 800,
            marginTop: '0.4rem',
            fontFamily: 'var(--font-primary)'
          }}>
            {course?.title}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
            Duration: {course?.duration} | Course Curriculum Verified
          </span>
        </div>

        {/* Bottom signature row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          borderTop: '1px solid #cbd5e1',
          paddingTop: '1rem',
          marginTop: 'auto'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Completion Date</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              {completedAt ? new Date(completedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'N/A'}
            </span>
          </div>

          {/* Golden Seal element */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f1c40f',
            border: '4px dotted #d4ac0d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-10deg)',
            boxShadow: '0 4px 8px rgba(241,196,15,0.1)'
          }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#7d6608', textAlign: 'center', lineHeight: 1.1 }}>
              OFFICIAL<br />SEAL
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontFamily: 'Georgia, serif', color: '#0054a6', fontStyle: 'italic', marginBottom: '-0.3rem', opacity: 0.8 }}>
              G. Srinivasarao
            </div>
            <div style={{ width: '150px', height: '1px', backgroundColor: '#cbd5e1', display: 'inline-block', margin: '0.25rem 0' }} />
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Proprietor & Director</span>
          </div>
        </div>

        {/* Unique verification footer */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '0.6rem',
          color: '#94a3b8'
        }}>
          Online Certificate Verification ID: <strong>{certificateId}</strong> | InfoWave Training Center
        </div>
      </div>

      {/* Print css rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          .no-print {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-frame {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 277mm !important;
            height: 190mm !important;
            max-width: 277mm !important;
            max-height: 190mm !important;
            margin: 0 !important;
            padding: 3rem !important;
            border-width: 12px !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            background-color: #fdfbf7 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}} />
    </div>
  );
}
