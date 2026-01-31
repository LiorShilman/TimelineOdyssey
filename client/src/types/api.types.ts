// API Response types

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Moment {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  momentDate: string;
  emotion: 'happy' | 'sad' | 'exciting' | 'nostalgic' | 'neutral' | null;
  importance: number | null;
  locationName: string | null;
  locationLat: string | null;
  locationLng: string | null;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mediaFiles: MediaFile[];
  tags: MomentTag[];
  relations: MomentRelation[];
}

export interface MediaFile {
  id: string;
  momentId: string;
  fileName: string;
  fileType: 'image' | 'video' | 'other';
  mimeType: string;
  fileSize: number;
  storageKey: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  metadata: any;
  orderIndex: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface MomentTag {
  momentId: string;
  tagId: string;
  tag: Tag;
}

export interface MomentRelation {
  momentId: string;
  relatedMomentId: string;
  relationType: 'same_people' | 'same_location' | 'same_event';
  relatedMoment: {
    id: string;
    title: string;
    momentDate: string;
    emotion: string | null;
  };
}

export interface MomentStats {
  total: number;
  byEmotion: Record<string, number>;
  byImportance: Record<number, number>;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateMomentRequest {
  title: string;
  description?: string;
  momentDate: string;
  emotion?: 'happy' | 'sad' | 'exciting' | 'nostalgic' | 'neutral';
  importance?: number;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  isDraft?: boolean;
}

export interface UpdateMomentRequest extends Partial<CreateMomentRequest> {}

export interface GetMomentsParams {
  emotion?: string;
  importance?: number;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}
