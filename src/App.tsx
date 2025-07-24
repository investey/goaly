import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AffirmationDisplay } from './components/AffirmationDisplay';
import { BookmarksView } from './components/BookmarksView';
import { SearchView } from './components/SearchView';
import { useAffirmations } from './hooks/useAffirmations';
import { ViewMode } from './types';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
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
      if (e.deltaY < 0) {
        // Scroll up - new affirmation
        getRandomAffirmation();
      } else if (e.deltaY > 0 && affirmationHistory.length > 0) {
        // Scroll down - previous affirmation
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
  }, [viewMode, getRandomAffirmation, goToPreviousAffirmation, affirmationHistory.length]);

  // Handle URL parameters for shared affirmations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedAffirmation = urlParams.get('affirmation');
    if (sharedAffirmation) {
      // Handle shared affirmation if needed
      console.log('Shared affirmation:', sharedAffirmation);
    }
  }, []);

  const handleBookmarkToggle = () => {
    console.log('Bookmark button clicked for affirmation:', currentAffirmation);
    toggleBookmark(currentAffirmation);
  };

  const handleShare = () => {
    shareAffirmation(currentAffirmation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navigation
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewAffirmation={getRandomAffirmation}
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
    </div>
  );
}

export default App;