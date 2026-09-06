import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        paddingTop: '110px',
        paddingBottom: '40px',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Glow */}
      <div
        className="floating-orb"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(155, 142, 196, 0.3) 0%, transparent 70%)',
          top: '-5%',
          right: '0%',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Minimal, Direct Copy */}
          <div className="hero-copy">
            <div
              className="luxury-badge"
              style={{
                marginBottom: '18px',
                fontSize: '0.78rem',
              }}
            >
              <Sparkles size={13} color="var(--primary-soft-purple)" />
              <span>BECAUSE NOT EVERY VOICE IS REAL</span>
            </div>

            <h1
              className="hero-title"
              style={{
                fontSize: 'clamp(2.4rem, 4.4vw, 3.6rem)',
                lineHeight: 1.15,
                fontWeight: 800,
                marginBottom: '18px',
                letterSpacing: '-0.03em',
              }}
            >
              Spot AI Voice Clones in <span className="gradient-text">Seconds</span>
            </h1>

            <p
              className="hero-description"
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '480px',
              }}
            >
              Drop a recording or use your microphone. VoxGuard scans acoustic signatures to tell you if a voice is a real human or an AI deepfake.
            </p>

            {/* Light, Skimmable Trust Badges */}
            <div
              className="hero-trust"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--primary-soft-purple)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  99.4% Accuracy
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--primary-soft-purple)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Instant Results
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-real)',
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  100% Private (0 Storage)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Relevant Visual Graphic */}
          <div
            className="hero-visual"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg), 0 0 40px rgba(155, 142, 196, 0.25)',
              border: '1px solid rgba(155, 142, 196, 0.3)',
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <img
              src="/hero-visual.jpg"
              alt="VoxGuard AI Voice Verification Visual"
              fetchPriority="high"
              decoding="async"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
