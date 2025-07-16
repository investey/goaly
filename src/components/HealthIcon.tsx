import React from 'react';

interface HealthIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HealthIcon: React.FC<HealthIconProps> = ({ className, style }) => {
  return (
    <img 
      src="/standing.png" 
      alt="Health Icon" 
      className={className}
      style={style}
    />
  );
};