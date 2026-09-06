import React from 'react';
import { PhoneCall, ShieldAlert, Cpu, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const THREAT_SCENARIOS = [
  {
    id: 'clone-speed',
    icon: Cpu,
    tag: '3 SECONDS',
    tagColor: '#7c6daa',
    title: 'Voicemail Cloned in 3s',
    takeaway: 'Scammers rip audio from social media or voicemail to clone cadence and accent instantly.',
    graphic: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '40px', padding: '0 8px' }}>
        {[20, 36, 15, 40, 24, 38, 12, 30, 26, 18, 35, 22].map((h, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: `${h}px`,
              background: i > 6 ? '#F43F5E' : '#7c6daa',
              borderRadius: '2px',
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    ),
    visualBadge: 'Human audio (left) vs AI generated clone (right)'
  },
  {
    id: 'emergency-scam',
    icon: PhoneCall,
    tag: 'FAMILY EMERGENCY',
    tagColor: '#EF4444',
    title: 'Panicked Relative Scam',
    takeaway: 'Spoofs a family member pleading for immediate money. Protect with an offline secret word.',
    graphic: (
      <div
        style={{
          background: 'rgba(254, 242, 242, 0.9)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>Incoming: "Grandson"</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>Fake Voice</span>
      </div>
    ),
    visualBadge: 'Emotional distress manufactured to bypass skepticism'
  },
  {
    id: 'wire-fraud',
    icon: ShieldAlert,
    tag: 'WIRE TRANSFER',
    tagColor: '#D4AF37',
    title: 'Executive Wire Impersonation',
    takeaway: 'Simulates a CFO or CEO voice demanding urgent funds release before weekend cutoff.',
    graphic: (
      <div
        style={{
          background: 'rgba(255, 251, 235, 0.9)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>Urgent Wire Authorization</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600 }}>High Risk</span>
      </div>
    ),
    visualBadge: 'Voice authorization falsified via deepfake speech'
  }
];

export default function MasonryGrid() {
  return (
    <section
      id="threat-intel"
      style={{
        padding: '70px 0',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Minimal Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div className="luxury-badge" style={{ marginBottom: '12px' }}>
            <AlertCircle size={14} />
            <span>THREAT INTELLIGENCE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', marginBottom: '10px' }}>
            How Voice Scams <span className="gradient-text">Happen</span>
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>
            3 common tactics used by voice cloning scammers today.
          </p>
        </div>

        {/* Light-Reading Illustrated Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {THREAT_SCENARIOS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top tag */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: card.tagColor,
                        background: 'rgba(155, 142, 196, 0.12)',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {card.tag}
                    </span>
                    <Icon size={18} color={card.tagColor} />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                    {card.title}
                  </h3>

                  {/* 1-Line Minimal Takeaway */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                    {card.takeaway}
                  </p>
                </div>

                {/* Graphic Visual Box */}
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    {card.graphic}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {card.visualBadge}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
