export enum Emotion {
  HAPPY = 'happy',
  SAD = 'sad',
  EXCITING = 'exciting',
  NOSTALGIC = 'nostalgic',
  NEUTRAL = 'neutral',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export enum RelationType {
  SAME_PEOPLE = 'same_people',
  SAME_LOCATION = 'same_location',
  SAME_EVENT = 'same_event',
}

export interface MomentCreateInput {
  title: string;
  description?: string;
  momentDate: Date;
  emotion?: Emotion;
  importance?: number;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  tags?: string[];
  isDraft?: boolean;
}

export interface MomentUpdateInput extends Partial<MomentCreateInput> {
  id: string;
}

export interface MediaFileInput {
  file: File;
  orderIndex?: number;
}

export interface TimelineDataPoint {
  id: string;
  title: string;
  momentDate: Date;
  emotion?: Emotion;
  importance: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  thumbnailUrl?: string;
}

export interface TimelineStats {
  totalMoments: number;
  momentsPerYear: Record<number, number>;
  emotionDistribution: Record<Emotion, number>;
  storageUsed: number;
  averageImportance: number;
}
