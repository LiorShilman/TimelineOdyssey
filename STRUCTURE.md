# Timeline Odyssey - Project Structure

## Directory Tree

```
timeline-odyssey/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── assets/                  # Images, fonts, etc.
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/              # React Components
│   │   │   ├── 3d/                  # Three.js 3D components
│   │   │   │   ├── Scene.tsx        # Main 3D scene
│   │   │   │   ├── MomentBubble.tsx # Individual moment sphere
│   │   │   │   ├── Galaxy.tsx       # Galaxy structure
│   │   │   │   ├── Camera.tsx       # Camera controller
│   │   │   │   ├── Particles.tsx    # Particle effects
│   │   │   │   └── Connections.tsx  # Lines between moments
│   │   │   │
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── TagInput.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   │
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   │
│   │   │   ├── moments/             # Moment-related components
│   │   │   │   ├── MomentForm.tsx
│   │   │   │   ├── MomentDetail.tsx
│   │   │   │   ├── MomentCard.tsx
│   │   │   │   ├── MediaUploader.tsx
│   │   │   │   ├── MediaGallery.tsx
│   │   │   │   └── MomentFilters.tsx
│   │   │   │
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   └── common/              # Common components
│   │   │       ├── Loader.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── SearchBar.tsx
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── TimelinePage.tsx
│   │   │   ├── ListView.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   └── auth/
│   │   │       ├── LoginPage.tsx
│   │   │       └── RegisterPage.tsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useMoments.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useMediaUpload.ts
│   │   │   ├── use3DControls.ts
│   │   │   └── useTimeline.ts
│   │   │
│   │   ├── stores/                  # Zustand state stores
│   │   │   ├── authStore.ts
│   │   │   ├── momentStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── timelineStore.ts
│   │   │
│   │   ├── services/                # API services
│   │   │   ├── api.ts               # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── momentService.ts
│   │   │   ├── mediaService.ts
│   │   │   └── timelineService.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── dateHelpers.ts
│   │   │   ├── fileHelpers.ts
│   │   │   ├── colorHelpers.ts
│   │   │   ├── 3dHelpers.ts
│   │   │   └── validators.ts
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   ├── moment.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── 3d.types.ts
│   │   │
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── server/                          # Backend Express Application
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema
│   │   ├── seed.ts                  # Database seeding
│   │   └── migrations/              # Database migrations
│   │
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── moment.controller.ts
│   │   │   ├── media.controller.ts
│   │   │   ├── tag.controller.ts
│   │   │   └── timeline.controller.ts
│   │   │
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── moment.routes.ts
│   │   │   ├── media.routes.ts
│   │   │   ├── tag.routes.ts
│   │   │   └── timeline.routes.ts
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── moment.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── storage.service.ts   # S3/MinIO
│   │   │   ├── image.service.ts     # Sharp processing
│   │   │   ├── video.service.ts     # FFmpeg processing
│   │   │   ├── email.service.ts
│   │   │   └── cache.service.ts     # Redis
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.utils.ts
│   │   │   ├── password.utils.ts
│   │   │   ├── file.utils.ts
│   │   │   └── logger.utils.ts
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   ├── express.d.ts
│   │   │   └── custom.types.ts
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   ├── database.config.ts
│   │   │   ├── storage.config.ts
│   │   │   └── email.config.ts
│   │   │
│   │   └── server.ts                # Entry point
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                       # Root gitignore
├── docker-compose.yml               # Docker services
├── package.json                     # Monorepo package.json
├── PRD.md                          # Product Requirements Document
├── README.md                        # Project README
└── STRUCTURE.md                     # This file

```

## Key Files Description

### Client

- **vite.config.ts**: Vite bundler configuration with path aliases
- **tailwind.config.js**: Tailwind CSS customization
- **src/main.tsx**: React application entry point
- **src/App.tsx**: Root component with routing
- **src/stores/**: Zustand stores for global state management
- **src/services/api.ts**: Axios instance with interceptors
- **src/components/3d/**: All Three.js/R3F components

### Server

- **server.ts**: Express server setup
- **prisma/schema.prisma**: Database schema definition
- **controllers/**: Handle HTTP requests/responses
- **services/**: Business logic layer
- **middleware/**: Request processing pipeline
- **routes/**: API endpoint definitions

### Docker

- **docker-compose.yml**: Orchestrates all services (PostgreSQL, Redis, MinIO, App)
- **client/Dockerfile**: Client container build
- **server/Dockerfile**: Server container build with FFmpeg

## Development Workflow

1. **Start Docker services**: `npm run docker:up`
2. **Run migrations**: `npm run prisma:migrate`
3. **Start dev servers**: `npm run dev`
4. **Access**:
   - Client: http://localhost:5173
   - Server: http://localhost:3001
   - MinIO: http://localhost:9001

## Next Steps for Development

### Phase 1: Setup (Week 1)
1. Initialize project: `npm install`
2. Configure environment variables
3. Run Prisma migrations
4. Set up MinIO bucket
5. Test basic client-server connection

### Phase 2: Authentication (Week 2)
1. Implement auth service (JWT)
2. Create login/register pages
3. Add protected routes
4. Implement auth middleware

### Phase 3: Moment Management (Weeks 3-4)
1. Build moment CRUD operations
2. Implement file upload (images first)
3. Create moment form UI
4. Add media gallery component

### Phase 4: 3D Timeline (Weeks 5-7)
1. Set up Three.js scene
2. Create bubble component
3. Implement galaxy layout
4. Add camera controls
5. Connect to real data

### Phase 5: Polish (Weeks 8-10)
1. Add filters and search
2. Implement detail panel
3. Performance optimization
4. Testing and bug fixes

## Technologies Used

### Frontend
- React 18, TypeScript, Vite
- Three.js, React Three Fiber, Drei
- Zustand (state), Axios (API)
- Tailwind CSS, Framer Motion

### Backend
- Node.js, Express, TypeScript
- Prisma (ORM), PostgreSQL
- Redis (cache), MinIO/S3 (storage)
- Sharp (images), FFmpeg (video)
- JWT, bcrypt

### DevOps
- Docker, Docker Compose
- GitHub Actions (future)
- Vercel/Netlify (frontend)
- AWS/DigitalOcean (backend)
