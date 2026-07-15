'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PrintButton() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Grab the certificate container element
      const element = document.querySelector('.certificate-frame');
      if (!element) {
        alert('Certificate layout not found on page.');
        setDownloading(false);
        return;
      }

      // Configure HTML to canvas rendering options
      const captureOptions = {
        scale: 2, // Renders canvas in 2x HD resolution for print quality
        useCORS: true, // Allow cross-origin photo resources if any
        logging: false,
        backgroundColor: '#fdfbf7' // Maintain parchment background color
      };

      const canvas = await html2canvas(element, captureOptions);
      const imgData = canvas.toDataURL('image/png');

      // Create standard landscape A4 PDF document (297mm width by 210mm height)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Fit captured image exactly to A4 boundaries
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

      // Extract certificate ID for file naming
      let certId = 'IW';
      const idElement = document.querySelector('.certificate-frame strong');
      if (idElement) {
        certId = idElement.innerText.trim();
      }

      // Trigger browser direct file download
      pdf.save(`InfoWave-Certificate-${certId}.pdf`);
    } catch (err) {
      console.error('Direct PDF generation failed:', err);
      alert('Direct PDF generation failed. Opening print-to-PDF wizard as fallback...');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={handleDownloadPDF} 
        disabled={downloading}
        className="btn btn-primary" 
        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {downloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}
      </button>
      <button 
        onClick={() => typeof window !== 'undefined' && window.print()} 
        className="btn btn-outline" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Print
      </button>
    </div>
  );
}
