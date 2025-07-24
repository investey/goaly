import { BookmarkedAffirmation, Affirmation } from '../types';
import { secureStorage } from './security';

const BOOKMARKS_KEY = 'goaly-bookmarks';
const HISTORY_KEY = 'goaly-history';

export const saveBookmarks = (bookmarks: BookmarkedAffirmation[]): void => {
  secureStorage.setItem(BOOKMARKS_KEY, bookmarks);
};

export const loadBookmarks = (): BookmarkedAffirmation[] => {
  return secureStorage.getItem(BOOKMARKS_KEY) || [];
};

export const saveHistory = (history: Affirmation[]): void => {
  secureStorage.setItem(HISTORY_KEY, history);
};

export const loadHistory = (): Affirmation[] => {
  return secureStorage.getItem(HISTORY_KEY) || [];
};

export const addToBookmarks = (affirmation: Affirmation): BookmarkedAffirmation[] => {
  const bookmarks = loadBookmarks();
  const existingIndex = bookmarks.findIndex(b => b.id === affirmation.id);
  
  if (existingIndex === -1) {
    const newBookmark: BookmarkedAffirmation = {
      ...affirmation,
      isPinned: false,
      bookmarkedAt: Date.now()
    };
    bookmarks.push(newBookmark);
    saveBookmarks(bookmarks);
  }
  
  return bookmarks;
};

export const removeFromBookmarks = (affirmationId: string): BookmarkedAffirmation[] => {
  const bookmarks = loadBookmarks();
  const updatedBookmarks = bookmarks.filter(b => b.id !== affirmationId);
  saveBookmarks(updatedBookmarks);
  return updatedBookmarks;
};

export const togglePin = (affirmationId: string): BookmarkedAffirmation[] => {
  const bookmarks = loadBookmarks();
  const updatedBookmarks = bookmarks.map(bookmark =>
    bookmark.id === affirmationId
      ? { ...bookmark, isPinned: !bookmark.isPinned }
      : bookmark
  );
  saveBookmarks(updatedBookmarks);
  return updatedBookmarks;
};

export const getSortedBookmarks = (bookmarks: BookmarkedAffirmation[]): BookmarkedAffirmation[] => {
  return [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.bookmarkedAt - a.bookmarkedAt;
  });
};