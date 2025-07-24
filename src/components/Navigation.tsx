import React from 'react';
import { Bookmark, Plus, Search, Menu, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  currentPage: 'main' | 'bookmarks' | 'search';
  onPageChange: (page: 'main' | 'bookmarks' | 'search') => void;
  onNewAffirmation: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  onNewAffirmation
}) => {
  const handleGoalyClick = () => {
    onPageChange('main');
    onNewAffirmation();
  };

  if (currentPage === 'bookmarks' || currentPage === 'search') {
    return (
      <nav className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => onPageChange('main')}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {currentPage === 'bookmarks' ? 'Bookmarks' : 'Search'}
        </h1>
        <div className="w-10" />
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <button
        onClick={handleGoalyClick}
        className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
        style={{ fontFamily: 'Fredoka One, cursive' }}
      >
        Goaly
      </button>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onPageChange('bookmarks')}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Bookmark size={24} />
        </button>
        <button
          onClick={onNewAffirmation}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Plus size={24} />
        </button>
        <button
          onClick={() => onPageChange('search')}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Search size={24} />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};