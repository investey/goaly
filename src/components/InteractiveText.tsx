import React, { useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { DollarBillIcon } from './DollarBillIcon';
import { HealthIcon } from './HealthIcon';

interface InteractiveTextProps {
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
  onLetterClick: (index: number) => void;
  clickedLetters: Set<number>;
  allLettersClicked: boolean;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  category,
  onLetterClick,
  clickedLetters,
  allLettersClicked,
}) => {
  useEffect(() => {
    if (allLettersClicked) {
      createBurstAnimation();
    }
  }, [allLettersClicked]);

  const createBurstAnimation = () => {
    const container = document.querySelector('.affirmation-container');
    if (!container) return;

    const icons = [];
    const iconCount = 15;

    for (let i = 0; i < iconCount; i++) {
      const icon = document.createElement('div');
      icon.className = 'burst-icon';
      icon.style.position = 'fixed';
      icon.style.left = '50%';
      icon.style.top = '50%';
      icon.style.transform = 'translate(-50%, -50%)';
      icon.style.pointerEvents = 'none';
      icon.style.zIndex = '1000';
      icon.style.fontSize = '24px';

      const angle = (i / iconCount) * 2 * Math.PI;
      const distance = 150 + Math.random() * 100;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      icon.style.setProperty('--end-x', `${endX}px`);
      icon.style.setProperty('--end-y', `${endY}px`);
      icon.style.animation = 'heartBurst 2s ease-out forwards';

      if (category === 'love') {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        icon.appendChild(heart);
      } else if (category === 'wealth') {
        const dollar = document.createElement('div');
        dollar.innerHTML = '💵';
        icon.appendChild(dollar);
      } else if (category === 'health') {
        const health = document.createElement('div');
        health.innerHTML = '💪';
        icon.appendChild(health);
      } else if (category === 'learning') {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        icon.appendChild(star);
      }

      container.appendChild(icon);
      icons.push(icon);

      setTimeout(() => {
        if (icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }
      }, 2000);
    }
  };

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'love':
        return { fill: 'letter-fill', glow: 'letter-glow' };
      case 'wealth':
        return { fill: 'letter-fill-wealth', glow: 'letter-glow-wealth' };
      case 'health':
        return { fill: 'letter-fill-health', glow: 'letter-glow-health' };
      case 'learning':
        return { fill: 'letter-fill-learning', glow: 'letter-glow-learning' };
      default:
        return { fill: 'letter-fill', glow: 'letter-glow' };
    }
  };

  const { fill, glow } = getCategoryClasses(category);

  return (
    <div className="affirmation-container">
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight select-none"
        style={{ fontFamily: 'Fredoka One, cursive' }}
      >
        {text.split('').map((char, index) => {
          const isClicked = clickedLetters.has(index);
          const isLetter = /[a-zA-Z]/.test(char);
          
          if (!isLetter) {
            return (
              <span key={index} className="inline-block">
                {char}
              </span>
            );
          }

          return (
            <span
              key={index}
              className={`inline-block cursor-pointer transition-all duration-300 letter-sparkle ${
                isClicked ? `${fill} ${glow}` : 'hover:scale-110'
              }`}
              onClick={() => onLetterClick(index)}
              style={{
                textShadow: isClicked ? '0 0 20px rgba(255, 255, 255, 0.8)' : 'none',
              }}
            >
              {char}
            </span>
          );
        })}
      </h1>
    </div>
  );
};