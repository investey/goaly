import React from 'react';
import { Bookmark, Plus, Search, Menu, ArrowLeft } from 'lucide-react';
import { ViewMode } from '../types';

interface NavigationProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewAffirmation: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  viewMode,
  onViewChange,
  onNewAffirmation,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {viewMode !== 'main' ? (
            <button
              onClick={() => onViewChange('main')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to main"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={onNewAffirmation}
              className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              Goaly
            </button>
          )}
        </div>

        {viewMode === 'main' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('bookmarks')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="View bookmarks"
            >
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onNewAffirmation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="New affirmation"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => onViewChange('search')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search affirmations"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};