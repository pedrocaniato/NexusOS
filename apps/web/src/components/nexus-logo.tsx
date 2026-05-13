'use client';

import React from 'react';

interface NexusLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * NexusOS Logo Component
 * Renders the stylized "N" emblem and the "NEXUS OS" text.
 * - "NEXUS" in golden-yellow (#D4A017)
 * - "OS" in emerald green (#1B8C3D)
 * - The "N" emblem uses interleaved green and yellow strokes forming a geometric "N"
 */
export function NexusLogo({ size = 'md', showText = true, className = '' }: NexusLogoProps) {
  const dimensions = {
    sm: { emblem: 28, fontSize: 15, osFontSize: 15, gap: 6 },
    md: { emblem: 34, fontSize: 19, osFontSize: 19, gap: 7 },
    lg: { emblem: 48, fontSize: 28, osFontSize: 28, gap: 10 },
  };

  const d = dimensions[size];

  return (
    <div className={`flex items-center ${className}`} style={{ gap: d.gap }}>
      {/* Stylized "N" Emblem — faithfully reproducing the two-tone geometric N */}
      <svg
        width={d.emblem}
        height={d.emblem}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="NexusOS Logo Emblem"
      >
        {/* Green left vertical stroke */}
        <path d="M20 105 L20 30 L32 15 L32 105" fill="#1B8C3D" />
        {/* Yellow left-inner vertical + diagonal */}
        <path d="M38 105 L38 35 L50 20 L50 105" fill="#D4A017" />
        {/* Green diagonal from top-left to center */}
        <path d="M32 15 L65 70 L53 70 L20 15 Z" fill="#1B8C3D" />
        {/* Yellow diagonal from center to top-right */}
        <path d="M50 20 L85 78 L73 78 L38 18 Z" fill="#D4A017" />
        {/* Green right-inner vertical */}
        <path d="M68 105 L68 35 L80 18 L80 105" fill="#1B8C3D" />
        {/* Yellow right vertical stroke */}
        <path d="M86 105 L86 30 L98 15 L98 105" fill="#D4A017" />
        {/* Green diagonal descending right */}
        <path d="M80 18 L98 15 L98 25 L80 28 Z" fill="#1B8C3D" />
      </svg>

      {/* Text portion */}
      {showText && (
        <div className="flex items-baseline" style={{ gap: 1 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: d.fontSize,
              letterSpacing: '0.06em',
              color: '#D4A017',
              lineHeight: 1,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            NEXUS
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: d.osFontSize,
              letterSpacing: '0.06em',
              color: '#1B8C3D',
              lineHeight: 1,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            OS
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NexusOS Emblem Only (for favicon / icon usage)
 * Renders just the stylized "N" as an inline SVG.
 */
export function NexusEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexusOS Emblem"
    >
      <path d="M20 105 L20 30 L32 15 L32 105" fill="#1B8C3D" />
      <path d="M38 105 L38 35 L50 20 L50 105" fill="#D4A017" />
      <path d="M32 15 L65 70 L53 70 L20 15 Z" fill="#1B8C3D" />
      <path d="M50 20 L85 78 L73 78 L38 18 Z" fill="#D4A017" />
      <path d="M68 105 L68 35 L80 18 L80 105" fill="#1B8C3D" />
      <path d="M86 105 L86 30 L98 15 L98 105" fill="#D4A017" />
      <path d="M80 18 L98 15 L98 25 L80 28 Z" fill="#1B8C3D" />
    </svg>
  );
}
