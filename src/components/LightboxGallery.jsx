import React, { useState, useEffect } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight, Eye, ShieldCheck, Waves } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: 'spectrogram-natural',
    title: 'Natural Human Glottal Pulses',
    subtitle: 'Acoustic Frequency Heatmap (0Hz - 8000Hz)',
    tag: 'Authentic Human',
    badgeColor: '#10B981',
    image: 'https://picsum.photos/seed/voice-forensics-1/900/600',
    description: 'Notice the organic decay, subtle non-linear breathing gaps, and dynamic micro-jitter created by real human vocal cords vibrating against moving air.'
  },
  {
    id: 'spectrogram-cloned',
    title: 'Neural Vocoder Phase Inversion',
    subtitle: 'Synthesized Deepfake Clone Spectrum',
    tag: 'AI Deepfake',
    badgeColor: '#EF4444',
    image: 'https://picsum.photos/seed/voice-ai-synth/900/600',
    description: 'Reveals the telltale horizontal artifact bands typical of diffusion and autoregressive audio synthesizers where mathematical harmonics remain unnaturally rigid.'
  },
  {
    id: 'telephony-degradation',
    title: 'Telephony GSM Compression Analysis',
    subtitle: 'Filtering Scam Call Audio Compression',
    tag: 'Scam Call Forensics',
    badgeColor: '#7c6daa',
    image: 'https://picsum.photos/seed/phone-audio-wave/900/600',
    description: 'VoxGuard filters out standard carrier compression (8kHz AMR-NB) to isolate raw acoustic generation artifacts from network line noise.'
  },
  {
    id: 'cross-language-clone',
    title: 'Cross-Lingual Voice Cloning Vector',
    subtitle: 'Zero-Shot Timbre Embedding Inspection',
    tag: 'Zero-Shot Model',
    badgeColor: '#D4AF37',
    image: 'https://picsum.photos/seed/sound-frequency-map/900/600',
    description: 'Modern voice clones synthesize speech in languages the victim never spoke, yet retain subtle mathematical artifacts in formant transition velocities.'
  }
];

export default function LightboxGallery() {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowRight' && activeImageIndex !== null) {
        setActiveImageIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
      }
      if (e.key === 'ArrowLeft' && activeImageIndex !== null) {
        setActiveImageIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex]);

  return (
    <section
      id="forensics-gallery"
      style={{
        padding: '90px 0',
        background: 'linear-gradient(180deg, transparent 0%, rgba(245, 243, 255, 0.7) 100%)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 50px' }}>
          <div className="luxury-badge" style={{ marginBottom: '14px' }}>
            <Waves size={14} />
            <span>FORENSIC LAB & SPECTRAL EVIDENCE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '14px' }}>
            Visualizing the <span className="gradient-text">Invisible Acoustic Fingerprint</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            To the human ear, an AI clone sounds identical. Under VoxGuard's neural microscope, the mathematical flaws become crystal clear. Click to inspect full-res.
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px',
          }}
        >
          {GALLERY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="glass-card"
              onClick={() => setActiveImageIndex(index)}
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'var(--transition-smooth)',
              }}
            >
              {/* Image Container with Hover Zoom */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Overlay Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: item.badgeColor,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {item.tag}
                </span>

                {/* Hover Zoom Icon */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--primary-soft-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <ZoomIn size={18} />
                </div>
              </div>

              {/* Info Block */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {item.subtitle}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeImageIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(22, 17, 36, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.25s ease-out',
          }}
          onClick={() => setActiveImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
            }}
            style={{
              position: 'absolute',
              left: '20px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
            }}
            style={{
              position: 'absolute',
              right: '20px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Modal Content Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={GALLERY_ITEMS[activeImageIndex].image}
              alt={GALLERY_ITEMS[activeImageIndex].title}
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
              }}
            />

            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: GALLERY_ITEMS[activeImageIndex].badgeColor,
                    background: 'rgba(155, 142, 196, 0.15)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {GALLERY_ITEMS[activeImageIndex].tag}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {GALLERY_ITEMS[activeImageIndex].subtitle}
                </span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>
                {GALLERY_ITEMS[activeImageIndex].title}
              </h3>

              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {GALLERY_ITEMS[activeImageIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
