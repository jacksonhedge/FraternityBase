import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Chapter {
  id: string;
  greekOrganizationId: string;
  universityId: string;
  chapterName: string;
  charterDate?: string;
  memberCount: number;
  officerCount: number;
  status: 'active' | 'inactive' | 'suspended' | 'colony';
  gpaRequirement?: number;
  duesAmount?: number;
  houseAddress?: string;
  instagramHandle?: string;
  facebookPage?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  engagementScore: number;
  partnershipOpenness: 'open' | 'selective' | 'closed';
  eventFrequency: number;
  philanthropyFocus?: string;
  university?: {
    id: string;
    name: string;
    location: string;
    state: string;
  };
  greekOrganization?: {
    id: string;
    name: string;
    greekLetters: string;
    organizationType: 'fraternity' | 'sorority' | 'honor_society';
  };
}

interface ChaptersState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  savedChapters: string[];
  filters: {
    universities: string[];
    organizationTypes: string[];
    partnershipOpenness: string[];
    minEngagementScore: number;
    searchQuery: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ChaptersState = {
  chapters: [],
  selectedChapter: null,
  savedChapters: JSON.parse(localStorage.getItem('savedChapters') || '[]'),
  filters: {
    universities: [],
    organizationTypes: [],
    partnershipOpenness: [],
    minEngagementScore: 0,
    searchQuery: '',
  },
  isLoading: false,
  error: null,
};

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setChapters: (state, action: PayloadAction<Chapter[]>) => {
      state.chapters = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedChapter: (state, action: PayloadAction<Chapter>) => {
      state.selectedChapter = action.payload;
    },
    toggleSavedChapter: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      const index = state.savedChapters.indexOf(chapterId);
      if (index > -1) {
        state.savedChapters.splice(index, 1);
      } else {
        state.savedChapters.push(chapterId);
      }
      localStorage.setItem('savedChapters', JSON.stringify(state.savedChapters));
    },
    updateFilters: (state, action: PayloadAction<Partial<ChaptersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setChapters,
  setSelectedChapter,
  toggleSavedChapter,
  updateFilters,
  clearFilters,
  setLoading,
  setError,
} = chaptersSlice.actions;

export default chaptersSlice.reducer;