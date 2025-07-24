import { affirmations } from '../data/affirmations';
import { Affirmation, CategoryType } from '../types';

export const getRandomAffirmation = (excludeId?: string): Affirmation => {
  const availableAffirmations = excludeId 
    ? affirmations.filter(a => a.id !== excludeId)
    : affirmations;
  
  const randomIndex = Math.floor(Math.random() * availableAffirmations.length);
  return availableAffirmations[randomIndex];
};

export const searchAffirmations = (query: string, category?: string): Affirmation[] => {
  return affirmations.filter(affirmation => {
    const matchesQuery = query === '' || 
      affirmation.text.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || 
      category === 'all' || 
      affirmation.category === category;
    
    return matchesQuery && matchesCategory;
  });
};

export const getCategoryColor = (category: CategoryType): string => {
  const colors = {
    love: 'text-pink-600',
    wealth: 'text-green-600', 
    health: 'text-blue-600',
    learning: 'text-yellow-600'
  };
  return colors[category];
};

export const getCategoryBgColor = (category: CategoryType): string => {
  const colors = {
    love: 'bg-pink-100',
    wealth: 'bg-green-100',
    health: 'bg-blue-100', 
    learning: 'bg-yellow-100'
  };
  return colors[category];
};

export const getCategoryLetterClasses = (category: CategoryType): { fill: string; glow: string } => {
  const classes = {
    love: { fill: 'letter-fill', glow: 'letter-glow' },
    wealth: { fill: 'letter-fill-wealth', glow: 'letter-glow-wealth' },
    health: { fill: 'letter-fill-health', glow: 'letter-glow-health' },
    learning: { fill: 'letter-fill-learning', glow: 'letter-glow-learning' }
  };
  return classes[category];
};