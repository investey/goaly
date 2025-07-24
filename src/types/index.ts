export interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

export interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
  bookmarkedAt: number;
}

export type ViewMode = 'main' | 'bookmarks' | 'search';
export type CategoryFilter = 'all' | 'love' | 'wealth' | 'health' | 'learning' | 'natural';