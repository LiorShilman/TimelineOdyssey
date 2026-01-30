import { create } from 'zustand';
import { momentService } from '../services/momentService';
import type {
  Moment,
  CreateMomentRequest,
  UpdateMomentRequest,
  GetMomentsParams,
  MomentStats,
} from '../types/api.types';
import { toast } from 'sonner';

interface MomentStore {
  moments: Moment[];
  selectedMoment: Moment | null;
  stats: MomentStats | null;
  isLoading: boolean;
  error: string | null;
  filters: GetMomentsParams;

  // Actions
  fetchMoments: (params?: GetMomentsParams) => Promise<void>;
  fetchMomentById: (id: string) => Promise<void>;
  createMoment: (data: CreateMomentRequest) => Promise<Moment>;
  updateMoment: (id: string, data: UpdateMomentRequest) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  restoreMoment: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setSelectedMoment: (moment: Moment | null) => void;
  setFilters: (filters: GetMomentsParams) => void;
  clearMoments: () => void;
}

export const useMomentStore = create<MomentStore>((set, get) => ({
  moments: [],
  selectedMoment: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchMoments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const filters = params || get().filters;
      const moments = await momentService.getMoments(filters);
      set({ moments, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בטעינת רגעים';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchMomentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const moment = await momentService.getMomentById(id);
      set({ selectedMoment: moment, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בטעינת הרגע';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createMoment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const moment = await momentService.createMoment(data);
      set((state) => ({
        moments: [moment, ...state.moments],
        isLoading: false,
      }));
      toast.success('הרגע נוצר בהצלחה!');
      get().fetchStats(); // Refresh stats after creation
      return moment;
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה ביצירת הרגע';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  updateMoment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMoment = await momentService.updateMoment(id, data);
      set((state) => ({
        moments: state.moments.map((m) => (m.id === id ? updatedMoment : m)),
        selectedMoment: state.selectedMoment?.id === id ? updatedMoment : state.selectedMoment,
        isLoading: false,
      }));
      toast.success('הרגע עודכן בהצלחה!');
      get().fetchStats(); // Refresh stats after update
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בעדכון הרגע';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  deleteMoment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await momentService.deleteMoment(id);
      set((state) => ({
        moments: state.moments.filter((m) => m.id !== id),
        selectedMoment: state.selectedMoment?.id === id ? null : state.selectedMoment,
        isLoading: false,
      }));
      toast.success('הרגע נמחק בהצלחה');
      get().fetchStats(); // Refresh stats after deletion
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה במחיקת הרגע';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  restoreMoment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const restoredMoment = await momentService.restoreMoment(id);
      set((state) => ({
        moments: [restoredMoment, ...state.moments],
        isLoading: false,
      }));
      toast.success('הרגע שוחזר בהצלחה!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בשחזור הרגע';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchStats: async () => {
    try {
      const stats = await momentService.getMomentStats();
      set({ stats });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  },

  setSelectedMoment: (moment) => set({ selectedMoment: moment }),

  setFilters: (filters) => set({ filters }),

  clearMoments: () =>
    set({
      moments: [],
      selectedMoment: null,
      stats: null,
      filters: {},
    }),
}));
