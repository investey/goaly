import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BookmarkedAffirmation } from '../types';
import { getCategoryColor, getCategoryBgColor } from '../utils/affirmations';
import { getSortedBookmarks } from '../utils/storage';

interface BookmarksPageProps {
  bookmarks: BookmarkedAffirmation[];
  onTogglePin: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectAffirmation: (affirmation: BookmarkedAffirmation) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  bookmarks,
  onTogglePin,
  onRemoveBookmark,
  onSelectAffirmation
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const sortedBookmarks = getSortedBookmarks(bookmarks);

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      onRemoveBookmark(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No bookmarks yet</p>
          <p className="text-gray-400">
            Bookmark affirmations by clicking the bookmark icon while viewing them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {sortedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
              ${getCategoryBgColor(bookmark.category)} border-gray-200
            `}
            onClick={() => onSelectAffirmation(bookmark)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
                  {bookmark.text}
                </p>
                <span className={`text-sm font-medium ${getCategoryColor(bookmark.category)}`}>
                  {bookmark.category.charAt(0).toUpperCase() + bookmark.category.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(bookmark.id);
                  }}
                  className={`
                    p-2 rounded transition-colors
                    ${bookmark.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}
                  `}
                >
                  <img 
                    src="/thumbtack (3).png" 
                    alt="Pin" 
                    className="w-5 h-5"
                    style={{ 
                      filter: bookmark.isPinned 
                        ? 'brightness(0) saturate(100%) invert(25%) sepia(95%) saturate(1748%) hue-rotate(213deg) brightness(97%) contrast(101%)'
                        : 'none'
                    }}
                  />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(bookmark.id);
                  }}
                  className={`
                    p-2 rounded transition-colors
                    ${confirmDelete === bookmark.id 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-gray-400 hover:text-red-600'
                    }
                  `}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {confirmDelete === bookmark.id && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                Click again to confirm deletion
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};