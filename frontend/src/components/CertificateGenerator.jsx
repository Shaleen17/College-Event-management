import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * CertificateGenerator
 * Props:
 *  - studentName: string
 *  - eventTitle: string
 *  - eventDate: string (ISO)
 *  - eventVenue: string
 *  - eventCategory: string
 *  - onClose: function
 */
const CertificateGenerator = ({ studentName, eventTitle, eventDate, eventVenue, eventCategory, onClose }) => {
  const certRef = useRef(null);

  const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const categoryColors = {
    Technical: '#0369a1',
    Cultural: '#7e22ce',
    Sports: '#15803d',
    Workshop: '#c2410c',
  };
  const accentColor = categoryColors[eventCategory] || '#2D5741';

  const handleDownload = async () => {
    const element = certRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${studentName.replace(/\s+/g, '_')}_${eventTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="cert-modal" onClick={e => e.stopPropagation()}>
        <div className="cert-modal-actions">
          <button className="btn-primary" onClick={handleDownload}>⬇️ Download PDF</button>
          <button className="btn-secondary" onClick={onClose}>✕ Close</button>
        </div>

        {/* Certificate Canvas */}
        <div className="cert-wrapper">
          <div ref={certRef} className="certificate">
            {/* Outer border decoration */}
            <div className="cert-outer-border" style={{ borderColor: accentColor }}>
              <div className="cert-inner-border" style={{ borderColor: accentColor }}>

                {/* Header */}
                <div className="cert-header">
                  <div className="cert-logo-row">
                    <div className="cert-logo-circle" style={{ background: accentColor }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>TCET</span>
                    </div>
                    <div>
                      <div className="cert-org">Thakur College of Engineering & Technology</div>
                      <div className="cert-org-sub">Mumbai, Maharashtra</div>
                    </div>
                  </div>
                  <div className="cert-title-section">
                    <div className="cert-category-badge" style={{ background: accentColor }}>
                      {eventCategory} Event
                    </div>
                    <h1 className="cert-main-title">Certificate of Participation</h1>
                  </div>
                </div>

                {/* Decorative divider */}
                <div className="cert-divider" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

                {/* Body */}
                <div className="cert-body">
                  <p className="cert-body-text">This is to proudly certify that</p>
                  <div className="cert-student-name" style={{ borderBottomColor: accentColor }}>
                    {studentName}
                  </div>
                  <p className="cert-body-text">
                    has successfully participated in the event
                  </p>
                  <div className="cert-event-name" style={{ color: accentColor }}>
                    "{eventTitle}"
                  </div>
                  <p className="cert-body-text">
                    held on <strong>{formattedDate}</strong> at <strong>{eventVenue}</strong>
                  </p>
                </div>

                {/* Decorative divider */}
                <div className="cert-divider" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

                {/* Footer */}
                <div className="cert-footer">
                  <div className="cert-sign-block">
                    <div className="cert-sign-line" style={{ borderTopColor: accentColor }} />
                    <div className="cert-sign-label">Event Coordinator</div>
                    <div className="cert-sign-name">TCET Events Team</div>
                  </div>
                  <div className="cert-seal" style={{ borderColor: accentColor }}>
                    <div className="cert-seal-inner" style={{ color: accentColor }}>
                      <div style={{ fontSize: '1.5rem' }}>🏅</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '1px' }}>CERTIFIED</div>
                    </div>
                  </div>
                  <div className="cert-sign-block">
                    <div className="cert-sign-line" style={{ borderTopColor: accentColor }} />
                    <div className="cert-sign-label">Issued On</div>
                    <div className="cert-sign-name">{today}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
