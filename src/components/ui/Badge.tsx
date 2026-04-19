import React from 'react';
import './Badge.css';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'solid';
  style?: React.CSSProperties;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'outline', style }) => {
  return (
    <span className={`badge badge-${variant}`} style={style}>
      {children}
    </span>
  );
};
