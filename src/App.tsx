import React, { useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AffirmationDisplay } from './components/AffirmationDisplay';
import { SideActions } from './components/SideActions';
import { BurstAnimation } from './components/BurstAnimation';
import { BookmarksPage } from './components/BookmarksPage';
import { SearchPage } from './components/SearchPage';
import { useAffirmations } from './hooks/useAffirmations';
import { useTouch } from './hooks/useTouch';

function App() {
  const {
    currentAffirmation,
    currentPage,
    searchQuery,
    selectedCategory,
    searchResults,
    bookmarks,
    completedLetters,
    showBurst,
    touchStartY,
    isScrolling,
    isBookmarked,
    generateNewAffirmation,
    navigateHistory,
    handleLetterClick,
    handleBookmark,
    handleTogglePin,
    handleRemoveBookmark,
    handleShare,
    handlePageChange,
    handleSearchChange,
    handleCategoryChange,
    handleSelectAffirmation
  } = useAffirmations();

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouch({
    onSwipeUp: () => navigateHistory('up'),
    onSwipeDown: () => navigateHistory('down'),
    touchStartY,
    isScrolling,
    setTouchStartY: (y) => {/* handled in useAffirmations */},
    setIsScrolling: (scrolling) => {/* handled in useAffirmations */}
  });

  // Handle URL parameters for shared affirmations
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedAffirmation = urlParams.get('affirmation');
    
    if (sharedAffirmation) {
      // Could implement shared affirmation display here
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle scroll events for navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (currentPage !== 'main') return;
      
      e.preventDefault();
      if (e.deltaY < 0) {
        navigateHistory('up');
      } else if (e.deltaY > 0) {
        navigateHistory('down');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage, navigateHistory]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'bookmarks':
        return (
          <BookmarksPage
            bookmarks={bookmarks}
            onTogglePin={handleTogglePin}
            onRemoveBookmark={handleRemoveBookmark}
            onSelectAffirmation={handleSelectAffirmation}
          />
        );
      
      case 'search':
        return (
          <SearchPage
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            searchResults={searchResults}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSelectAffirmation={handleSelectAffirmation}
          />
        );
      
      default:
        return (
          <>
            <AffirmationDisplay
              affirmation={currentAffirmation}
              completedLetters={completedLetters}
              onLetterClick={handleLetterClick}
            />
            <SideActions
              affirmation={currentAffirmation}
              isBookmarked={isBookmarked}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          </>
        );
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onNewAffirmation={generateNewAffirmation}
      />
      
      {renderCurrentPage()}
      
      {showBurst && (
        <BurstAnimation
          category={currentAffirmation.category}
          onComplete={() => {/* handled in useAffirmations */}}
        />
      )}
    </div>
  );
}

export default App;