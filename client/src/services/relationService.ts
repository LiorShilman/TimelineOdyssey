import { api } from './api';

export interface CreateRelationDto {
  momentId: string;
  relatedMomentId: string;
  relationType: 'same_people' | 'same_location' | 'same_event';
}

export async function createRelation(data: CreateRelationDto): Promise<void> {
  await api.post('/relations', data);
}

export async function deleteRelation(momentId: string, relatedMomentId: string): Promise<void> {
  await api.delete(`/relations/${momentId}/${relatedMomentId}`);
}
