import React, { useEffect, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { DollarBillIcon } from './DollarBillIcon';
import { HealthIcon } from './HealthIcon';
import { CategoryType } from '../types';

interface BurstAnimationProps {
  category: CategoryType;
  onComplete: () => void;
}

export const BurstAnimation: React.FC<BurstAnimationProps> = ({ category, onComplete }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      delay: Math.random() * 0.3
    }));
    
    setParticles(newParticles);

    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getIcon = () => {
    switch (category) {
      case 'love':
        return <Heart className="w-6 h-6 text-pink-500" fill="currentColor" />;
      case 'wealth':
        return <DollarBillIcon className="w-6 h-6" />;
      case 'health':
        return <HealthIcon className="w-6 h-6" />;
      case 'learning':
        return <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />;
      default:
        return <Heart className="w-6 h-6 text-pink-500" fill="currentColor" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            '--end-x': `${particle.x}px`,
            '--end-y': `${particle.y}px`,
            animation: `heartBurst 2s ease-out ${particle.delay}s forwards`
          } as React.CSSProperties}
        >
          {getIcon()}
        </div>
      ))}
    </div>
  );
};