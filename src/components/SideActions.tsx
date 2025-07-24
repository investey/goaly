import React from 'react';
import { Bookmark, Link, Check } from 'lucide-react';
import { Affirmation } from '../types';

interface SideActionsProps {
  affirmation: Affirmation;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}

export const SideActions: React.FC<SideActionsProps> = ({
  affirmation,
  isBookmarked,
  onBookmark,
  onShare
}) => {
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
      <button
        onClick={onBookmark}
        className={`
          p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110
          ${isBookmarked 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-600 hover:text-blue-500'
          }
        `}
      >
        {isBookmarked ? <Check size={24} /> : <Bookmark size={24} />}
      </button>
      
      <button
        onClick={onShare}
        className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:text-blue-500 transition-all duration-300 hover:scale-110"
      >
        <Link size={24} />
      </button>
    </div>
  );
};