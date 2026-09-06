import React, { useState, useEffect } from 'react';
import { Github, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'var(--transition-smooth)',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.88)' : 'rgba(245, 243, 255, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div
        className="container navbar-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Name — Clean, Elegant Luxury Typography (No bulky logo) */}
        <a
          href="#"
          className="navbar-brand"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <span
            className="navbar-wordmark"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
            }}
          >
            Vox<span style={{ color: 'var(--primary-soft-purple)' }}>Guard</span>
          </span>
          <span
            className="navbar-tagline"
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}
          >
            Because Not Every Voice Is Real
          </span>
        </a>

        {/* Right side: GitHub link */}
        <a
          href="https://github.com/open-filer/voxGuard"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-github"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.86rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid var(--border-subtle)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-lavender-ultra-light)';
            e.currentTarget.style.borderColor = 'var(--primary-lavender)';
            e.currentTarget.style.color = 'var(--primary-soft-purple-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Github size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}
