import React from 'react';

interface DollarBillIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const DollarBillIcon: React.FC<DollarBillIconProps> = ({ className, style }) => {
  return (
    <img 
      src="/dollar-bill.png" 
      alt="Dollar Bill" 
      className={className}
      style={style}
      draggable={false}
    />
  );
};