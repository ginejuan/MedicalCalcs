import React from 'react';

type TypographyProps = {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';
  children: React.ReactNode;
  className?: string;  
  as?: React.ElementType;
  style?: React.CSSProperties;
};

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body1', 
  children, 
  className = '',
  as,
  style
}) => {
  const Component: any = as || getElementForVariant(variant);
  const baseStyle = getStyleForVariant(variant);

  return (
    <Component className={`${baseStyle} ${className}`} style={{ margin: 0, ...style }}>
      {children}
    </Component>
  );
};

function getElementForVariant(variant: string): React.ElementType {
  switch (variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'caption': return 'span';
    default: return 'p';
  }
}

function getStyleForVariant(variant: string): string {
  // We use inline styles or mapped utility classes depending on the atomic rule.
  // Using pure CSS rules defined in tokens where applicable.
  switch (variant) {
    case 'h1':
      return 'font-serif text-h1';
    case 'h2':
      return 'font-sans text-h2';
    case 'h3':
      return 'font-sans text-h3';
    case 'body1':
      return 'font-sans text-body1';
    case 'body2':
      return 'font-sans text-body2 text-secondary';
    case 'caption':
      return 'font-sans text-xs text-secondary uppercase tracking-widest';
    default:
      return 'font-sans';
  }
}
