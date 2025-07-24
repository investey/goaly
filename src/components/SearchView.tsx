import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Affirmation, CategoryFilter } from '../types';
import { affirmations } from '../data/affirmations';

interface SearchViewProps {
  onSelectAffirmation: (affirmation: Affirmation) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectAffirmation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filteredAffirmations = useMemo(() => {
    let filtered = affirmations;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(affirmation => affirmation.category === categoryFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(affirmation =>
        affirmation.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, categoryFilter]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'love': return 'bg-pink-100 border-pink-200 text-pink-800';
      case 'wealth': return 'bg-green-100 border-green-200 text-green-800';
      case 'health': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'learning': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getButtonColor = (category: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    switch (category) {
      case 'love': return 'bg-pink-500 text-white';
      case 'wealth': return 'bg-green-500 text-white';
      case 'health': return 'bg-blue-500 text-white';
      case 'learning': return 'bg-yellow-500 text-white';
      default: return 'bg-purple-500 text-white';
    }
  };

  return (
    <div className="flex-1 px-6 py-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Fredoka One, cursive' }}>
        Search Affirmations
      </h2>
      
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonColor('all', categoryFilter === 'all')}`}
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter('love')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonColor('love', categoryFilter === 'love')}`}
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Love
          </button>
          <button
            onClick={() => setCategoryFilter('wealth')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonColor('wealth', categoryFilter === 'wealth')}`}
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Wealth
          </button>
          <button
            onClick={() => setCategoryFilter('health')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonColor('health', categoryFilter === 'health')}`}
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Health
          </button>
          <button
            onClick={() => setCategoryFilter('learning')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonColor('learning', categoryFilter === 'learning')}`}
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Learning
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAffirmations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No affirmations found matching your search.</p>
          </div>
        ) : (
          filteredAffirmations.map((affirmation) => (
            <div
              key={affirmation.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getCategoryColor(affirmation.category)}`}
              onClick={() => onSelectAffirmation(affirmation)}
            >
              <p className="font-medium text-lg mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {affirmation.text}
              </p>
              <span className="text-sm opacity-75 capitalize">
                {affirmation.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};