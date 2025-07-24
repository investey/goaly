export interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

export interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
  bookmarkedAt: number;
}

export interface AppState {
  currentAffirmation: Affirmation;
  currentPage: 'main' | 'bookmarks' | 'search';
  searchQuery: string;
  selectedCategory: string;
  affirmationHistory: Affirmation[];
  historyIndex: number;
  bookmarks: BookmarkedAffirmation[];
  completedLetters: Set<number>;
  showBurst: boolean;
  touchStartY: number | null;
  isScrolling: boolean;
}

export type CategoryType = 'love' | 'wealth' | 'health' | 'learning';