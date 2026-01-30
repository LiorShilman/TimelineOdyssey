import { api } from './api';
import type {
  ApiResponse,
  Moment,
  CreateMomentRequest,
  UpdateMomentRequest,
  GetMomentsParams,
  MomentStats,
} from '../types/api.types';

export const momentService = {
  /**
   * Get all moments for current user
   */
  async getMoments(params?: GetMomentsParams): Promise<Moment[]> {
    const response = await api.get<ApiResponse<Moment[]>>('/moments', { params });
    return response.data.data || [];
  },

  /**
   * Get a single moment by ID
   */
  async getMomentById(id: string): Promise<Moment> {
    const response = await api.get<ApiResponse<Moment>>(`/moments/${id}`);
    return response.data.data!;
  },

  /**
   * Create a new moment
   */
  async createMoment(data: CreateMomentRequest): Promise<Moment> {
    const response = await api.post<ApiResponse<Moment>>('/moments', data);
    return response.data.data!;
  },

  /**
   * Update a moment
   */
  async updateMoment(id: string, data: UpdateMomentRequest): Promise<Moment> {
    const response = await api.put<ApiResponse<Moment>>(`/moments/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete a moment (soft delete)
   */
  async deleteMoment(id: string): Promise<void> {
    await api.delete(`/moments/${id}`);
  },

  /**
   * Restore a deleted moment
   */
  async restoreMoment(id: string): Promise<Moment> {
    const response = await api.post<ApiResponse<Moment>>(`/moments/${id}/restore`);
    return response.data.data!;
  },

  /**
   * Get moment statistics
   */
  async getMomentStats(): Promise<MomentStats> {
    const response = await api.get<ApiResponse<MomentStats>>('/moments/stats');
    return response.data.data!;
  },
};
