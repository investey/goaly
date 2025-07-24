import React from 'react';
import { Pin, X } from 'lucide-react';
import { BookmarkedAffirmation } from '../types';

interface BookmarksViewProps {
  bookmarks: BookmarkedAffirmation[];
  onTogglePin: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectAffirmation: (affirmation: BookmarkedAffirmation) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onTogglePin,
  onRemoveBookmark,
  onSelectAffirmation,
}) => {
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.bookmarkedAt - a.bookmarkedAt;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'love': return 'bg-pink-100 border-pink-200 text-pink-800';
      case 'wealth': return 'bg-green-100 border-green-200 text-green-800';
      case 'health': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'learning': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
            No Bookmarks Yet
          </h2>
          <p className="text-gray-600">
            Start bookmarking your favorite affirmations to see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Fredoka One, cursive' }}>
        Your Bookmarks
      </h2>
      
      <div className="space-y-4">
        {sortedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getCategoryColor(bookmark.category)}`}
            onClick={() => onSelectAffirmation(bookmark)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-lg mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {bookmark.text}
                </p>
                <span className="text-sm opacity-75 capitalize">
                  {bookmark.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(bookmark.id);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    bookmark.isPinned
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
                  aria-label={bookmark.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(bookmark.id);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove bookmark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};