# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timeline Odyssey is a 3D web application that visualizes personal life memories as an interactive galaxy. Each memory ("moment") appears as a floating bubble in 3D space, positioned along a spiral timeline from birth to present. The project uses React Three Fiber for 3D rendering, Prisma with PostgreSQL for data persistence, and MinIO/S3 for media storage.

## Development Commands

### Initial Setup
```bash
npm install                    # Install all workspace dependencies
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run docker:up              # Start PostgreSQL, Redis, MinIO
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run database migrations
npm run dev                    # Start both client and server
```

### Common Development Commands
```bash
# Development
npm run dev                    # Start client (5173) and server (3001) concurrently
npm run dev:client             # Start only Vite dev server
npm run dev:server             # Start only Express server with hot reload

# Building
npm run build                  # Build both client and server
npm run build:client           # Build client for production (tsc + vite build)
npm run build:server           # Compile server TypeScript to dist/

# Testing
npm run test                   # Run tests in all workspaces
npm run test -- --watch        # Run tests in watch mode
cd client && npm run test:ui   # Open Vitest UI for client tests

# Linting
npm run lint                   # Lint both client and server
npm run lint -- --fix          # Auto-fix linting issues

# Database
npm run prisma:generate        # Regenerate Prisma Client after schema changes
npm run prisma:migrate         # Create and run new migration
npm run prisma:studio          # Open Prisma Studio GUI (view/edit data)
cd server && npm run prisma:seed  # Seed database with sample data

# Docker
npm run docker:up              # Start infrastructure (PostgreSQL, Redis, MinIO)
npm run docker:down            # Stop and remove containers
docker-compose logs -f server  # View server logs
docker-compose restart postgres # Restart specific service
```

### Running Specific Tests
```bash
# Client tests (uses Vitest)
cd client && npm run test -- path/to/test.spec.ts

# Server tests (uses Vitest)
cd server && npm run test -- path/to/test.spec.ts
```

### MinIO Setup (Required for Media Upload)
After running `npm run docker:up`, configure MinIO:
1. Open http://localhost:9001
2. Login: minioadmin / minioadmin123
3. Create bucket: `timeline-odyssey`
4. Set bucket policy to public (development only)

## Architecture

### Monorepo Structure
This is an npm workspaces monorepo with two main packages:
- `client/`: React + Vite frontend (port 5173)
- `server/`: Express.js backend (port 3001)

Both packages are managed from the root `package.json`. Scripts like `npm run dev` use `concurrently` to run both workspaces simultaneously.

### Tech Stack Summary
- **Frontend**: React 18, TypeScript, React Three Fiber (Three.js), Zustand, Tailwind CSS
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (primary data), Redis (caching)
- **Storage**: MinIO/S3 (media files)
- **Media Processing**: Sharp (images), FFmpeg (videos)
- **Auth**: JWT tokens with bcrypt password hashing

### Database Architecture

The data model centers around **Moments** (memories) owned by **Users**:

```
User (1) ──> (many) Moment
Moment (1) ──> (many) MediaFile
Moment (many) <──> (many) Tag (via MomentTag junction)
Moment (many) <──> (many) Moment (via MomentRelation - for related moments)
```

**Key Prisma patterns in this project:**
- All IDs use UUID (not auto-incrementing integers)
- Soft deletes: `deletedAt` field on Moments (not hard-deleted)
- Cascade deletes: Deleting a User removes all their Moments, MediaFiles, Tags
- Composite indexes on `moments(userId, momentDate)` for timeline queries
- JSONB `metadata` field on MediaFiles for EXIF data

**After modifying `schema.prisma`:**
1. Run `npm run prisma:migrate` to create and apply migration
2. Run `npm run prisma:generate` to update Prisma Client types

### 3D Visualization Architecture

The core innovation is the **Galaxy Timeline** - a 3D spiral structure where moments are positioned chronologically.

**Key 3D concepts:**
- **Bubble**: Each moment is rendered as a sphere using `<mesh>` with `<sphereGeometry>`
- **Positioning**: Moments are arranged along a spiral path (earlier dates = inner spiral, later dates = outer)
- **Size**: Bubble radius determined by `importance` field (1-5 scale)
- **Color**: Bubble color reflects `emotion` field:
  - `happy` → Gold (#FFD700)
  - `sad` → Blue (#4169E1)
  - `exciting` → Orange (#FF6347)
  - `nostalgic` → Purple (#9370DB)
  - `neutral` → Gray (#A9A9A9)
- **Texture**: First image of moment's media displayed on bubble surface

**React Three Fiber structure:**
```tsx
<Canvas>                        // Main Three.js renderer
  <Scene>                       // Lighting, environment setup
    <Galaxy>                    // Container for all moments
      <MomentBubble />          // Individual sphere for each moment
      <MomentBubble />
      ...
    </Galaxy>
    <Connections />             // Lines between related moments
    <Particles />               // Ambient particle effects
    <Camera />                  // Custom camera controller
  </Scene>
</Canvas>
```

**Performance considerations:**
- Use Level of Detail (LOD): distant bubbles should use low-poly geometries
- Frustum culling: only render visible bubbles
- Texture compression: use compressed formats for bubble textures
- Lazy loading: fetch moment details only when bubble is clicked
- Target: 60 FPS desktop, 30 FPS mobile

### State Management with Zustand

The app uses Zustand stores (not Redux/Context) for global state:

**Client stores (`client/src/stores/`):**
- `authStore.ts`: Current user, JWT token, login/logout actions
- `momentStore.ts`: Moments array, selected moment, CRUD operations
- `uiStore.ts`: UI state (sidebar open, modal state, loading indicators)
- `timelineStore.ts`: 3D timeline state (camera position, filters, selected date range)

**Zustand pattern:**
```typescript
import { create } from 'zustand';

interface MomentStore {
  moments: Moment[];
  selectedMoment: Moment | null;
  setMoments: (moments: Moment[]) => void;
  selectMoment: (moment: Moment | null) => void;
}

export const useMomentStore = create<MomentStore>((set) => ({
  moments: [],
  selectedMoment: null,
  setMoments: (moments) => set({ moments }),
  selectMoment: (moment) => set({ selectedMoment: moment }),
}));
```

**When to use stores vs. local state:**
- Use Zustand for data needed across multiple components (user, moments list, global UI state)
- Use local `useState` for component-specific state (form inputs, hover state)

### Media Processing Pipeline

When a user uploads media files:

1. **Client**: `MediaUploader.tsx` component handles drag-and-drop or file selection
2. **Upload**: Files sent to `POST /api/media/upload` via multipart/form-data
3. **Server**: Multer middleware receives files, stores temporarily
4. **Processing** (in `server/src/services/`):
   - **Images**: Sharp generates 3 versions (thumbnail 300px, medium 800px, full resolution)
   - **Videos**: FFmpeg generates thumbnail + compresses to 720p MP4
   - **Documents**: Stored as-is (PDF preview handled client-side)
   - **Audio**: Stored as-is
5. **Storage**: Processed files uploaded to MinIO/S3 with keys like `{userId}/{momentId}/{filename}`
6. **Database**: `MediaFile` record created with storage keys, dimensions, EXIF metadata
7. **Response**: Return media file IDs and URLs to client

**File size limits** (configured in `upload.middleware.ts`):
- Max file size: 100MB per file
- Max files per moment: 20

### Authentication Flow

JWT-based authentication (no sessions):

1. **Registration**: `POST /api/auth/register` → hash password with bcrypt → create User → send verification email
2. **Login**: `POST /api/auth/login` → validate credentials → generate JWT (expires 24h) + refresh token (expires 30d)
3. **Protected routes**: All `/api/moments`, `/api/media`, `/api/tags` require `Authorization: Bearer <token>`
4. **Middleware**: `authMiddleware` extracts JWT, verifies signature, attaches `req.user`
5. **Refresh**: `POST /api/auth/refresh` → validate refresh token → issue new JWT

**Frontend auth pattern:**
- Store JWT in Zustand `authStore` (in-memory, not localStorage for security)
- Axios interceptor adds `Authorization` header to all API requests
- Axios interceptor catches 401 errors → attempt token refresh → retry request
- On refresh failure → clear auth state → redirect to login

### API Design Patterns

**Controller → Service → Prisma pattern:**
```
routes/moment.routes.ts        // Define HTTP routes
  ↓
controllers/moment.controller.ts  // Handle request/response, validation
  ↓
services/moment.service.ts     // Business logic, database queries
  ↓
@prisma/client                 // Database operations
```

**Example flow for creating a moment:**
1. Client: `momentService.createMoment(data)` → `POST /api/moments`
2. Route: `/api/moments` → `authMiddleware` → `createMoment` controller
3. Controller: Validate request body (Joi schema) → call `momentService.create()`
4. Service: `prisma.moment.create({ data: {...} })` → return created moment
5. Controller: Return JSON response with 201 status
6. Client: Update Zustand store → re-render components

**Error handling:**
- Use `error.middleware.ts` for centralized error handling
- Throw descriptive errors from services: `throw new Error('Moment not found')`
- Controller catches and returns appropriate HTTP status

### 3D Layout Algorithm

Moments are positioned along a **logarithmic spiral** in 3D space:

**Spiral formula (pseudocode):**
```javascript
function calculatePosition(moment, allMoments) {
  const age = moment.momentDate - user.birthDate; // milliseconds since birth
  const normalizedAge = age / totalLifespan; // 0 to 1

  const angle = normalizedAge * Math.PI * 8; // 4 full rotations
  const radius = 5 + normalizedAge * 20; // spiral expands outward
  const height = normalizedAge * 10; // vertical spread

  return {
    x: Math.cos(angle) * radius,
    y: height,
    z: Math.sin(angle) * radius,
  };
}
```

**Clustering related moments:**
- Moments with shared tags should be visually closer
- Use `MomentRelation` table to draw lines between related bubbles
- Line color indicates relation type (people/location/event)

### Environment Variables

**Server (server/.env):**
```bash
DATABASE_URL=postgresql://timeline_user:timeline_password@localhost:5432/timeline_odyssey
REDIS_URL=redis://localhost:6379
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=30d

# MinIO (S3-compatible)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_ENDPOINT=http://localhost:9000
AWS_BUCKET_NAME=timeline-odyssey
AWS_REGION=us-east-1

# Email (optional for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Client (client/.env):**
```bash
VITE_API_URL=http://localhost:3001/api
```

## Key Implementation Patterns

### Creating a New API Endpoint

1. **Define Prisma model** (if needed): Edit `server/prisma/schema.prisma`
2. **Run migration**: `npm run prisma:migrate`
3. **Create service**: `server/src/services/feature.service.ts` (business logic)
4. **Create controller**: `server/src/controllers/feature.controller.ts` (request handling)
5. **Define routes**: `server/src/routes/feature.routes.ts`
6. **Register routes**: Import in `server/src/server.ts` → `app.use('/api/feature', featureRoutes)`
7. **Create client service**: `client/src/services/featureService.ts` (API calls)
8. **Create Zustand store** (if needed): `client/src/stores/featureStore.ts`

### Creating a 3D Component

3D components live in `client/src/components/3d/`:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function MomentBubble({ moment }) {
  const meshRef = useRef<Mesh>(null);

  // Animation loop (runs every frame)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // Rotate bubble
    }
  });

  const color = EMOTION_COLORS[moment.emotion];
  const size = 0.5 + (moment.importance * 0.4); // 0.5-2.5 radius

  return (
    <mesh ref={meshRef} position={moment.position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

### Emotion Colors Reference

These color codes should be used consistently across the app:

```typescript
const EMOTION_COLORS = {
  happy: '#FFD700',      // Gold
  sad: '#4169E1',        // Royal Blue
  exciting: '#FF6347',   // Tomato Orange
  nostalgic: '#9370DB',  // Medium Purple
  neutral: '#A9A9A9',    // Dark Gray
};
```

### Testing Strategy

- **Client**: Vitest for unit tests, React Testing Library for component tests
- **Server**: Vitest for unit/integration tests, Supertest for API endpoint tests
- **E2E**: Playwright (not yet implemented)

**When writing tests:**
- Mock Prisma client in service tests
- Mock API calls in React component tests
- Test happy path + edge cases + error handling

## Important Constraints

### Security
- All user-uploaded content should be validated (file type, size)
- Never trust client-side validation - always validate on server
- Use parameterized queries (Prisma handles this automatically)
- Store JWTs in memory (Zustand), not localStorage (XSS vulnerability)
- Implement rate limiting on auth endpoints (already configured in middleware)

### Performance
- Images should always be optimized before display (use thumbnail/medium versions)
- Implement pagination for moments list (don't load all moments at once)
- Use Redis caching for frequently accessed data (user profiles, tag lists)
- 3D scene should use LOD and frustum culling for >1000 moments

### Database
- Always use soft deletes for Moments (`deletedAt` field, not `prisma.delete()`)
- Index fields used in WHERE clauses (already done for userId, momentDate, emotion)
- Use transactions for multi-step operations (e.g., creating moment + media files)

## Common Development Scenarios

### Adding a New Emotion Type
1. Update `emotion` field validation in `server/src/controllers/moment.controller.ts`
2. Add new color to `EMOTION_COLORS` constant in `client/src/utils/colorHelpers.ts`
3. Update emotion selector UI in `client/src/components/moments/MomentForm.tsx`
4. Update type definitions in `client/src/types/moment.types.ts`

### Adding a New Media Type
1. Update `fileType` validation in `upload.middleware.ts`
2. Add processing logic in `server/src/services/media.service.ts`
3. Add preview component in `client/src/components/moments/MediaGallery.tsx`
4. Update MIME type checks in `server/src/utils/file.utils.ts`

### Modifying the 3D Layout
1. Update position calculation in `client/src/utils/3dHelpers.ts` (or wherever spiral logic lives)
2. Adjust camera bounds in `client/src/components/3d/Camera.tsx`
3. Update LOD thresholds if changing scale
4. Test with varying numbers of moments (10, 100, 1000+)

## Troubleshooting

### "Prisma Client not generated" error
```bash
npm run prisma:generate
```

### Docker containers not starting
```bash
docker-compose down -v  # Remove volumes
npm run docker:up
```

### Port already in use
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### MinIO connection refused
Ensure MinIO is running (`docker-compose ps`) and bucket exists. Restart: `docker-compose restart minio`

## Additional Resources

- **PRD.md**: Full product requirements and feature specifications
- **STRUCTURE.md**: Detailed file structure and organization
- **DEV_GUIDE.md**: Step-by-step development guide with examples
- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Prisma Docs**: https://www.prisma.io/docs/
