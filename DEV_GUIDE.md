# Development Guide - Timeline Odyssey

## Getting Started with Claude Code

This project is optimized for development with Claude Code. Follow this guide to get started.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version
   ```

2. **Docker & Docker Compose** installed
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Claude Code CLI** installed
   ```bash
   # Install Claude Code if you haven't already
   npm install -g @anthropic/claude-code
   ```

## Initial Setup

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Environment Configuration

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

Edit `server/.env` and update:
- `JWT_SECRET` - Generate a secure random string
- `SMTP_*` - Add your email credentials (if needed)

### 3. Start Docker Services

```bash
# Start PostgreSQL, Redis, and MinIO
npm run docker:up

# Verify services are running
docker-compose ps
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
cd server && npm run prisma:seed
```

### 5. MinIO Bucket Setup

1. Open MinIO console: http://localhost:9001
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Create bucket named: `timeline-odyssey`
4. Set bucket access policy to `public` (for development)

### 6. Start Development Servers

```bash
# Start both client and server
npm run dev
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## Using Claude Code

### Recommended Claude Code Commands

#### 1. Create Authentication System
```
Create a complete authentication system with:
- User registration with email verification
- Login with JWT tokens
- Password reset functionality
- Protected routes middleware
- Auth context/store for React
```

#### 2. Build Moment CRUD
```
Implement moment management with:
- Create moment form with validation
- List all moments with pagination
- Update moment details
- Soft delete moments
- File upload integration
```

#### 3. Implement 3D Timeline
```
Create the 3D timeline visualization:
- Three.js scene setup with React Three Fiber
- MomentBubble component (sphere with emotion color)
- Galaxy layout (spiral positioning based on dates)
- Camera controls (orbit, zoom, pan)
- Click handlers for moment selection
```

#### 4. Add Media Upload
```
Implement media upload functionality:
- Drag-and-drop file upload
- Image optimization with Sharp
- Video processing with FFmpeg
- Progress indicators
- S3/MinIO storage integration
```

### Project Structure for Claude Code

When asking Claude Code to create features, reference this structure:

```
For React components → client/src/components/
For API endpoints → server/src/routes/ + server/src/controllers/
For business logic → server/src/services/
For database models → server/prisma/schema.prisma
For state management → client/src/stores/
For types → client/src/types/ or server/src/types/
```

## Development Workflow

### 1. Feature Development

1. **Plan the feature** - Review PRD.md for requirements
2. **Update database** - Modify Prisma schema if needed
3. **Create migration** - `npm run prisma:migrate`
4. **Backend first** - Create routes, controllers, services
5. **Frontend next** - Create components, pages, hooks
6. **Test** - Manually test the feature
7. **Commit** - Git commit with clear message

### 2. Database Changes

```bash
# After modifying schema.prisma
npm run prisma:migrate

# Generate updated Prisma Client
npm run prisma:generate

# Open Prisma Studio to view data
npm run prisma:studio
```

### 3. Testing New Features

```bash
# Run tests
npm run test

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run with coverage
npm run test -- --coverage
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code (if prettier is added)
npm run format
```

## Common Tasks

### Adding a New API Endpoint

1. **Define route** in `server/src/routes/`
2. **Create controller** in `server/src/controllers/`
3. **Add service logic** in `server/src/services/`
4. **Register route** in `server/src/server.ts`
5. **Test** with Postman or curl

Example:
```typescript
// server/src/routes/moment.routes.ts
import { Router } from 'express';
import { createMoment } from '../controllers/moment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.post('/', authMiddleware, createMoment);

export default router;
```

### Adding a New React Page

1. **Create page component** in `client/src/pages/`
2. **Add route** in `client/src/App.tsx`
3. **Create related components** if needed
4. **Add to navigation** if applicable

Example:
```typescript
// client/src/App.tsx
import TimelinePage from '@pages/TimelinePage';

<Route path="/timeline" element={<TimelinePage />} />
```

### Creating a Custom Hook

1. **Create hook file** in `client/src/hooks/`
2. **Use existing stores** or create new ones
3. **Import services** for API calls
4. **Export hook** for use in components

Example:
```typescript
// client/src/hooks/useMoments.ts
import { useEffect } from 'react';
import { useMomentStore } from '@stores/momentStore';
import { momentService } from '@services/momentService';

export function useMoments() {
  const { moments, setMoments, setLoading } = useMomentStore();
  
  useEffect(() => {
    fetchMoments();
  }, []);
  
  async function fetchMoments() {
    setLoading(true);
    const data = await momentService.getAll();
    setMoments(data);
    setLoading(false);
  }
  
  return { moments, fetchMoments };
}
```

## Debugging

### Backend Debugging

```bash
# View server logs
docker-compose logs -f server

# Access database directly
docker-compose exec postgres psql -U timeline_user -d timeline_odyssey

# Check Redis
docker-compose exec redis redis-cli
```

### Frontend Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Use Network tab to inspect API calls
- Use Zustand DevTools (if enabled)

### Database Debugging

```bash
# Open Prisma Studio
npm run prisma:studio

# View raw SQL queries
# Add this to Prisma Client instantiation:
log: ['query', 'info', 'warn', 'error']
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173 (client)
lsof -ti:5173 | xargs kill -9

# Kill process on port 3001 (server)
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

### MinIO Connection Issues

```bash
# Restart MinIO
docker-compose restart minio

# Check MinIO logs
docker-compose logs minio
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm install
```

## Production Build

### Build for Production

```bash
# Build both client and server
npm run build

# Build separately
npm run build:client
npm run build:server
```

### Test Production Build Locally

```bash
# Client
cd client && npm run preview

# Server
cd server && npm run start
```

## Next Steps

1. Review the [PRD.md](./PRD.md) for full requirements
2. Check [STRUCTURE.md](./STRUCTURE.md) for project organization
3. Start with authentication system
4. Build moment management
5. Implement 3D visualization
6. Add advanced features

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Prisma Docs**: https://www.prisma.io/docs/
- **Zustand Guide**: https://docs.pmnd.rs/zustand
- **Tailwind CSS**: https://tailwindcss.com/docs

## Getting Help

- Check existing GitHub issues
- Review PRD.md for requirements
- Consult Three.js examples
- Ask Claude Code for specific implementations

Happy coding! 🚀
