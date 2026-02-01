import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

const {
  AWS_ACCESS_KEY_ID = 'minioadmin',
  AWS_SECRET_ACCESS_KEY = 'minioadmin123',
  AWS_ENDPOINT = 'http://localhost:9000',
  AWS_BUCKET_NAME = 'timeline-odyssey',
  AWS_REGION = 'us-east-1',
} = process.env;

// S3 client configuration for MinIO
export const s3Client = new S3Client({
  endpoint: AWS_ENDPOINT,
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKET_NAME = AWS_BUCKET_NAME;

// Public URL for media files (may differ from internal endpoint when behind NAT/proxy)
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || AWS_ENDPOINT;

// Initialize bucket (create if doesn't exist)
async function initializeBucket() {
  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ S3 Bucket '${BUCKET_NAME}' is ready`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      // Bucket doesn't exist, create it
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`✅ Created S3 bucket: ${BUCKET_NAME}`);

        // Set public read policy for development
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
            },
          ],
        };

        await s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(policy),
          })
        );
        console.log(`✅ Set public policy for bucket: ${BUCKET_NAME}`);
      } catch (createError) {
        console.error('❌ Failed to create bucket:', createError);
      }
    } else {
      console.error('❌ Error checking bucket:', error);
    }
  }
}

// Initialize on module load
initializeBucket();

// Media file size limits (in bytes)
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES_PER_MOMENT = 20;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];
