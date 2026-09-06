import React, { useState, useEffect } from 'react';
import { Mic, ArrowUp } from 'lucide-react';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 400px and not at the very bottom
      const scrolled = window.scrollY > 400;
      setVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToDetector = () => {
    const target = document.getElementById('detector');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <div
      className="mobile-sticky-cta"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 900,
        animation: 'fadeIn 0.35s ease-out',
      }}
    >
      <button
        onClick={scrollToDetector}
        className="btn-primary"
        title="Quick Access: Test Voice Now"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 22px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 12px 28px -4px rgba(124, 109, 170, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 10px #10B981',
          }}
        />
        <Mic size={18} />
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verify Voice Now</span>
      </button>
    </div>
  );
}
