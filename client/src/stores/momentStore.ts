import { create } from 'zustand';
import type { Emotion } from '../types/moment.types';

interface Moment {
  id: string;
  title: string;
  description?: string;
  momentDate: Date;
  emotion?: Emotion;
  importance: number;
  locationName?: string;
  thumbnailUrl?: string;
  tags: string[];
}

interface MomentStore {
  moments: Moment[];
  selectedMoment: Moment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMoments: (moments: Moment[]) => void;
  addMoment: (moment: Moment) => void;
  updateMoment: (id: string, updates: Partial<Moment>) => void;
  deleteMoment: (id: string) => void;
  selectMoment: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMomentStore = create<MomentStore>((set) => ({
  moments: [],
  selectedMoment: null,
  isLoading: false,
  error: null,
  
  setMoments: (moments) => set({ moments }),
  
  addMoment: (moment) => set((state) => ({
    moments: [...state.moments, moment],
  })),
  
  updateMoment: (id, updates) => set((state) => ({
    moments: state.moments.map((m) => 
      m.id === id ? { ...m, ...updates } : m
    ),
  })),
  
  deleteMoment: (id) => set((state) => ({
    moments: state.moments.filter((m) => m.id !== id),
  })),
  
  selectMoment: (id) => set((state) => ({
    selectedMoment: id 
      ? state.moments.find((m) => m.id === id) || null 
      : null,
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
