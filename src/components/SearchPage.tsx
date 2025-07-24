import React from 'react';
import { Search } from 'lucide-react';
import { Affirmation } from '../types';
import { getCategoryColor, getCategoryBgColor } from '../utils/affirmations';

interface SearchPageProps {
  searchQuery: string;
  selectedCategory: string;
  searchResults: Affirmation[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSelectAffirmation: (affirmation: Affirmation) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  searchQuery,
  selectedCategory,
  searchResults,
  onSearchChange,
  onCategoryChange,
  onSelectAffirmation
}) => {
  const categories = [
    { id: 'all', name: 'All Categories', color: 'text-gray-600', bg: 'bg-gray-100' },
    { id: 'love', name: 'Love', color: 'text-pink-600', bg: 'bg-pink-100' },
    { id: 'wealth', name: 'Wealth', color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'health', name: 'Health', color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'learning', name: 'Learning', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category.id
                  ? `${category.bg} ${category.color} ring-2 ring-offset-1`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              style={{
                ringColor: selectedCategory === category.id ? 
                  category.color.replace('text-', '').replace('-600', '') : 'transparent'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? 'No affirmations found' : 'Start typing to search affirmations'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((affirmation) => (
              <div
                key={affirmation.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                  ${getCategoryBgColor(affirmation.category)} border-gray-200
                `}
                onClick={() => onSelectAffirmation(affirmation)}
              >
                <p className="text-gray-800 font-medium mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
                  {affirmation.text}
                </p>
                <span className={`text-sm font-medium ${getCategoryColor(affirmation.category)}`}>
                  {affirmation.category.charAt(0).toUpperCase() + affirmation.category.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};