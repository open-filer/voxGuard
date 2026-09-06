import React from 'react';
import { Upload, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Input Audio',
    subtitle: 'Upload a recording or speak into your mic.',
    icon: Upload,
  },
  {
    step: '02',
    title: 'Acoustic Scan',
    subtitle: 'Neural model checks vocoder artifacts & glottal pulses.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Certainty Score',
    subtitle: 'Instant percentage showing if voice is Real or AI.',
    icon: CheckCircle2,
  }
];

export default function WhyVoxGuard() {
  return (
    <section
      id="why-voxguard"
      style={{
        padding: '60px 0',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Simple Process Header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', marginBottom: '8px' }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>
            3 simple steps. No technical knowledge required.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="glass-card"
                style={{
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary-soft-purple) 0%, var(--primary-lavender) 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-soft-purple)', marginBottom: '2px' }}>
                    STEP {s.step}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {s.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy Note - Minimal (No duplicate test CTA button) */}
        <div
          style={{
            padding: '16px 22px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          <ShieldCheck size={18} color="var(--status-real)" />
          <span><strong>Zero Audio Storage:</strong> Recordings are evaluated in temporary memory and immediately discarded.</span>
        </div>
      </div>
    </section>
  );
}
