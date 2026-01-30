import { api } from './api';
import type { Tag } from '../types/api.types';

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface AttachTagDto {
  momentId: string;
  tagId: string;
}

/**
 * Get all tags for the current user
 */
export async function getTags(): Promise<Tag[]> {
  const response = await api.get('/tags');
  return response.data.tags;
}

/**
 * Create a new tag
 */
export async function createTag(data: CreateTagDto): Promise<Tag> {
  const response = await api.post('/tags', data);
  return response.data.tag;
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, data: Partial<CreateTagDto>): Promise<Tag> {
  const response = await api.put(`/tags/${tagId}`, data);
  return response.data.tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  await api.delete(`/tags/${tagId}`);
}

/**
 * Attach tag to moment
 */
export async function attachTagToMoment(momentId: string, tagId: string): Promise<void> {
  await api.post('/tags/attach', { momentId, tagId });
}

/**
 * Detach tag from moment
 */
export async function detachTagFromMoment(momentId: string, tagId: string): Promise<void> {
  await api.delete(`/tags/detach/${momentId}/${tagId}`);
}

/**
 * Get moments by tag
 */
export async function getMomentsByTag(tagId: string) {
  const response = await api.get(`/tags/${tagId}/moments`);
  return response.data.moments;
}
