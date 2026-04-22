import React from 'react';

export const CopyrightCC: React.FC = () => (
  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
      © 2026 Prof. Dr. Juan Jesús Fernández Alba
    </span>
    <a
      href="https://creativecommons.org/licenses/by-nc/4.0/"
      target="_blank"
      rel="noreferrer"
      title="Creative Commons Attribution-NonCommercial 4.0 International"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.7rem',
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px 8px',
        textDecoration: 'none',
        letterSpacing: '0.03em',
        transition: 'color var(--transition-fast)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
        <text x="12" y="8" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CC</text>
        <text x="6.5" y="17" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif">BY</text>
        <text x="17.5" y="17" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif">NC</text>
      </svg>
      CC BY-NC 4.0 — Non-commercial use
    </a>
  </div>
);
