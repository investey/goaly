import { useState, useEffect, useCallback } from 'react';
import { Affirmation, BookmarkedAffirmation, AppState } from '../types';
import { getRandomAffirmation, searchAffirmations } from '../utils/affirmations';
import { 
  loadBookmarks, 
  loadHistory, 
  saveHistory, 
  addToBookmarks, 
  removeFromBookmarks, 
  togglePin 
} from '../utils/storage';
import { rateLimiter } from '../utils/security';

export const useAffirmations = () => {
  const [state, setState] = useState<AppState>({
    currentAffirmation: getRandomAffirmation(),
    currentPage: 'main',
    searchQuery: '',
    selectedCategory: 'all',
    affirmationHistory: [],
    historyIndex: 0,
    bookmarks: [],
    completedLetters: new Set(),
    showBurst: false,
    touchStartY: null,
    isScrolling: false
  });

  // Load saved data on mount
  useEffect(() => {
    const savedBookmarks = loadBookmarks();
    const savedHistory = loadHistory();
    
    setState(prev => ({
      ...prev,
      bookmarks: savedBookmarks,
      affirmationHistory: savedHistory.length > 0 ? savedHistory : [prev.currentAffirmation]
    }));
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (state.affirmationHistory.length > 0) {
      saveHistory(state.affirmationHistory);
    }
  }, [state.affirmationHistory]);

  const generateNewAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new_affirmation', 20, 60000)) {
      return;
    }

    const newAffirmation = getRandomAffirmation(state.currentAffirmation.id);
    const newHistory = [newAffirmation, ...state.affirmationHistory].slice(0, 10);
    
    setState(prev => ({
      ...prev,
      currentAffirmation: newAffirmation,
      affirmationHistory: newHistory,
      historyIndex: 0,
      completedLetters: new Set(),
      showBurst: false
    }));
  }, [state.currentAffirmation.id, state.affirmationHistory]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up') {
      generateNewAffirmation();
    } else if (direction === 'down' && state.historyIndex < state.affirmationHistory.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({
        ...prev,
        currentAffirmation: prev.affirmationHistory[newIndex],
        historyIndex: newIndex,
        completedLetters: new Set(),
        showBurst: false
      }));
    }
  }, [generateNewAffirmation, state.historyIndex, state.affirmationHistory.length]);

  const handleLetterClick = useCallback((index: number) => {
    if (!rateLimiter.isAllowed('letter_click', 100, 60000)) {
      return;
    }

    const newCompletedLetters = new Set(state.completedLetters);
    newCompletedLetters.add(index);
    
    const totalLetters = state.currentAffirmation.text.replace(/\s/g, '').length;
    const isComplete = newCompletedLetters.size === totalLetters;
    
    setState(prev => ({
      ...prev,
      completedLetters: newCompletedLetters,
      showBurst: isComplete
    }));
  }, [state.completedLetters, state.currentAffirmation.text]);

  const handleBookmark = useCallback(() => {
    const isCurrentlyBookmarked = state.bookmarks.some(b => b.id === state.currentAffirmation.id);
    
    if (isCurrentlyBookmarked) {
      const updatedBookmarks = removeFromBookmarks(state.currentAffirmation.id);
      setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));
    } else {
      const updatedBookmarks = addToBookmarks(state.currentAffirmation);
      setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));
    }
  }, [state.bookmarks, state.currentAffirmation]);

  const handleTogglePin = useCallback((id: string) => {
    const updatedBookmarks = togglePin(id);
    setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));
  }, []);

  const handleRemoveBookmark = useCallback((id: string) => {
    const updatedBookmarks = removeFromBookmarks(id);
    setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(state.currentAffirmation.text)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [state.currentAffirmation.text]);

  const handlePageChange = useCallback((page: 'main' | 'bookmarks' | 'search') => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const handleSelectAffirmation = useCallback((affirmation: Affirmation) => {
    setState(prev => ({
      ...prev,
      currentAffirmation: affirmation,
      currentPage: 'main',
      completedLetters: new Set(),
      showBurst: false
    }));
  }, []);

  const searchResults = searchAffirmations(
    state.searchQuery, 
    state.selectedCategory === 'all' ? undefined : state.selectedCategory
  );

  const isBookmarked = state.bookmarks.some(b => b.id === state.currentAffirmation.id);

  return {
    ...state,
    searchResults,
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
  };
};