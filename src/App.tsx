import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { AffirmationDisplay } from './components/AffirmationDisplay';
import { BookmarksView } from './components/BookmarksView';
import { SearchView } from './components/SearchView';
import { useAffirmations } from './hooks/useAffirmations';
import { ViewMode } from './types';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [showNewAffirmationModal, setShowNewAffirmationModal] = useState(false);

  const {
    currentAffirmation,
    bookmarks,
    clickedLetters,
    allLettersClicked,
    affirmationHistory,
    getRandomAffirmation,
    goToPreviousAffirmation,
    handleLetterClick,
    isBookmarked,
    toggleBookmark,
    togglePin,
    removeBookmark,
    selectAffirmation,
    shareAffirmation,
  } = useAffirmations();

  // Handle scroll/swipe navigation
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) {
        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        if (Math.abs(deltaY) > 50) {
          isScrolling = true;
          if (deltaY > 0) {
            // Swipe up - new affirmation
            getRandomAffirmation();
          } else {
            // Swipe down - previous affirmation
            goToPreviousAffirmation();
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (viewMode !== 'main') return;
      
      e.preventDefault();
      if (e.deltaY > 0) {
        // Scroll down - new affirmation
        getRandomAffirmation();
      } else {
        // Scroll up - previous affirmation
        goToPreviousAffirmation();
      }
    };

    if (viewMode === 'main') {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [viewMode, getRandomAffirmation, goToPreviousAffirmation]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'main') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          getRandomAffirmation();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToPreviousAffirmation();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleBookmark(currentAffirmation);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          shareAffirmation(currentAffirmation);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentAffirmation, getRandomAffirmation, goToPreviousAffirmation, toggleBookmark, shareAffirmation]);

  const handleNewAffirmation = useCallback(() => {
    if (viewMode === 'main') {
      getRandomAffirmation();
    } else {
      setShowNewAffirmationModal(true);
    }
  }, [viewMode, getRandomAffirmation]);

  const handleBookmarkToggle = useCallback(() => {
    console.log('Bookmark button clicked!', currentAffirmation);
    toggleBookmark(currentAffirmation);
  }, [currentAffirmation, toggleBookmark]);

  const handleShare = useCallback(() => {
    console.log('Share button clicked!', currentAffirmation);
    shareAffirmation(currentAffirmation);
  }, [currentAffirmation, shareAffirmation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewAffirmation={handleNewAffirmation}
      />

      <div className="pt-16 h-screen flex flex-col">
        {viewMode === 'main' && (
          <AffirmationDisplay
            affirmation={currentAffirmation}
            isBookmarked={isBookmarked(currentAffirmation.id)}
            onBookmark={handleBookmarkToggle}
            onShare={handleShare}
            onLetterClick={handleLetterClick}
            clickedLetters={clickedLetters}
            allLettersClicked={allLettersClicked}
          />
        )}

        {viewMode === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onTogglePin={togglePin}
            onRemoveBookmark={removeBookmark}
            onSelectAffirmation={(affirmation) => {
              selectAffirmation(affirmation);
              setViewMode('main');
            }}
          />
        )}

        {viewMode === 'search' && (
          <SearchView
            onSelectAffirmation={(affirmation) => {
              selectAffirmation(affirmation);
              setViewMode('main');
            }}
          />
        )}
      </div>

      {showNewAffirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Fredoka One, cursive' }}>
              New Affirmation
            </h3>
            <p className="text-gray-600 mb-6">
              Would you like to get a new random affirmation?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  getRandomAffirmation();
                  setViewMode('main');
                  setShowNewAffirmationModal(false);
                }}
                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowNewAffirmationModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;