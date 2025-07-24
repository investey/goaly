import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import { Navigation } from './components/Navigation';
import { AffirmationDisplay } from './components/AffirmationDisplay';
import { BookmarksView } from './components/BookmarksView';
import { SearchView } from './components/SearchView';
import { useAffirmations } from './hooks/useAffirmations';
import { rateLimiter } from './utils/security';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const {
    currentAffirmation,
    bookmarks,
    clickedLetters,
    allLettersClicked,
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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (viewMode !== 'main') return;
      
      if (!rateLimiter.isAllowed('scroll', 3, 1000)) return;

      if (e.deltaY < 0) {
        getRandomAffirmation();
      } else if (e.deltaY > 0) {
        goToPreviousAffirmation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (viewMode !== 'main') return;
      const touch = e.touches[0];
      (window as any).touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (viewMode !== 'main') return;
      if (!(window as any).touchStartY) return;
      
      if (!rateLimiter.isAllowed('touch', 3, 1000)) return;

      const touch = e.changedTouches[0];
      const deltaY = (window as any).touchStartY - touch.clientY;
      const threshold = 50;

      if (deltaY > threshold) {
        getRandomAffirmation();
      } else if (deltaY < -threshold) {
        goToPreviousAffirmation();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewMode, getRandomAffirmation, goToPreviousAffirmation]);

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentAffirmation);
  };

  const handleShare = () => {
    shareAffirmation(currentAffirmation);
  };

  const handleSelectAffirmation = (affirmation: any) => {
    selectAffirmation(affirmation);
    setViewMode('main');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onNewAffirmation={getRandomAffirmation}
      />
      
      <div className="pt-16 min-h-screen flex flex-col">
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
            onSelectAffirmation={handleSelectAffirmation}
          />
        )}
        
        {viewMode === 'search' && (
          <SearchView onSelectAffirmation={handleSelectAffirmation} />
        )}
      </div>
    </div>
  );
}

export default App;