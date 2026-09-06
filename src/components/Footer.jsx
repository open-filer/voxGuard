import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        padding: '28px 0',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Left: Brand & Copyright */}
        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          © {currentYear} VoxGuard. Because Not Every Voice Is Real.
        </div>

        {/* Right: GitHub Repo */}
        <a
          href="https://github.com/open-filer/voxGuard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.86rem',
            fontWeight: 600,
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-soft-purple-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <Github size={16} />
          <span>open-filer/voxGuard</span>
        </a>
      </div>
    </footer>
  );
}
