import { useState, useCallback } from 'react';
import { Affirmation, BookmarkedAffirmation } from '../types';
import { affirmations } from '../data/affirmations';
import { useLocalStorage } from './useLocalStorage';
import { generateSecureId } from '../utils/security';

export function useAffirmations() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkedAffirmation[]>('goaly-bookmarks', []);
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(() => 
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [allLettersClicked, setAllLettersClicked] = useState(false);

  const getRandomAffirmation = useCallback(() => {
    const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmationHistory(prev => [currentAffirmation, ...prev.slice(0, 9)]);
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setAllLettersClicked(false);
  }, [currentAffirmation]);

  const goToPreviousAffirmation = useCallback(() => {
    if (affirmationHistory.length > 0) {
      const [previous, ...rest] = affirmationHistory;
      setCurrentAffirmation(previous);
      setAffirmationHistory(rest);
      setClickedLetters(new Set());
      setAllLettersClicked(false);
    }
  }, [affirmationHistory]);

  const handleLetterClick = useCallback((index: number) => {
    const char = currentAffirmation.text[index];
    if (!/[a-zA-Z]/.test(char)) return;

    setClickedLetters(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      
      const totalLetters = currentAffirmation.text.split('').filter(c => /[a-zA-Z]/.test(c)).length;
      const clickedLetterCount = Array.from(newSet).filter(i => /[a-zA-Z]/.test(currentAffirmation.text[i])).length;
      
      if (clickedLetterCount === totalLetters) {
        setAllLettersClicked(true);
      }
      
      return newSet;
    });
  }, [currentAffirmation.text]);

  const isBookmarked = useCallback((affirmationId: string) => {
    return bookmarks.some(bookmark => bookmark.id === affirmationId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((affirmation: Affirmation) => {
    console.log('toggleBookmark called with:', affirmation);
    setBookmarks(prev => {
      console.log('Current bookmarks:', prev);
      const existingIndex = prev.findIndex(bookmark => bookmark.id === affirmation.id);
      console.log('Existing index:', existingIndex);
      
      if (existingIndex >= 0) {
        console.log('Removing bookmark');
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        console.log('Adding bookmark');
        const newBookmark: BookmarkedAffirmation = {
          ...affirmation,
          isPinned: false,
          bookmarkedAt: Date.now(),
        };
        const newBookmarks = [...prev, newBookmark];
        console.log('New bookmarks:', newBookmarks);
        return newBookmarks;
      }
    });
  }, [setBookmarks]);

  const togglePin = useCallback((affirmationId: string) => {
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === affirmationId
          ? { ...bookmark, isPinned: !bookmark.isPinned }
          : bookmark
      )
    );
  }, [setBookmarks]);

  const removeBookmark = useCallback((affirmationId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== affirmationId));
  }, [setBookmarks]);

  const selectAffirmation = useCallback((affirmation: Affirmation) => {
    setAffirmationHistory(prev => [currentAffirmation, ...prev.slice(0, 9)]);
    setCurrentAffirmation(affirmation);
    setClickedLetters(new Set());
    setAllLettersClicked(false);
  }, [currentAffirmation]);

  const shareAffirmation = useCallback((affirmation: Affirmation) => {
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(affirmation.text)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Affirmation link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  }, []);

  return {
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
  };
}