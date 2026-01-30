# Product Requirements Document (PRD)
## Timeline Odyssey - 3D Life Timeline Platform

---

## 1. Executive Summary

### 1.1 Product Vision
Timeline Odyssey is an immersive 3D web application that transforms personal life memories into an interactive, navigable galaxy of moments. Users can upload, organize, and experience their life events in a visually stunning three-dimensional space, where each memory becomes a floating "bubble" in time.

### 1.2 Project Objectives
- Create an innovative 3D visualization platform for personal memories
- Provide intuitive navigation through a user's entire life timeline
- Support multiple media types (images, videos, documents, audio)
- Deliver a smooth, performant 3D experience across devices
- Enable emotional and contextual organization of memories

### 1.3 Target Audience
- Primary: Adults 25-55 who value documenting life experiences
- Secondary: Families wanting to preserve generational memories
- Tertiary: Digital nomads, content creators, life-logging enthusiasts

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **3D Engine**: Three.js + React Three Fiber (@react-three/fiber)
- **3D Utilities**: @react-three/drei (helpers, controls, utilities)
- **State Management**: Zustand (lightweight, suitable for 3D state)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + CSS Modules for 3D-specific styles
- **Animations**: Framer Motion (UI), GSAP (3D transitions)
- **Date Handling**: date-fns
- **File Upload**: react-dropzone
- **Media Processing**: Browser APIs (Canvas API, FileReader)

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (relational data) + Redis (caching)
- **ORM**: Prisma
- **File Storage**: AWS S3 / MinIO (self-hosted option)
- **Authentication**: JWT + bcrypt
- **Image Processing**: Sharp
- **Video Processing**: FFmpeg (via fluent-ffmpeg)
- **API Documentation**: Swagger/OpenAPI

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: 
  - Frontend: Vercel / Netlify
  - Backend: AWS EC2 / DigitalOcean
  - Database: AWS RDS / Managed PostgreSQL
- **CDN**: CloudFront / Cloudflare
- **Monitoring**: Sentry (errors), LogRocket (sessions)

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React App   │  │  Three.js    │  │   Zustand    │      │
│  │  Components  │  │   3D Scene   │  │    Store     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │  WebSocket   │  │   Auth       │      │
│  │  (Express)   │  │   Server     │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Moments    │  │    Media     │  │  Timeline    │      │
│  │   Service    │  │  Processing  │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   S3/MinIO   │      │
│  │  (Prisma)    │  │   (Cache)    │  │  (Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features & Requirements

### 3.1 User Authentication & Authorization

#### Requirements
- **UA-001**: User registration with email/password
- **UA-002**: Email verification
- **UA-003**: JWT-based authentication
- **UA-004**: Password reset functionality
- **UA-005**: OAuth integration (Google, Facebook) - Phase 2
- **UA-006**: Session management (refresh tokens)

#### Acceptance Criteria
- Passwords hashed with bcrypt (min 10 rounds)
- JWT tokens expire after 24 hours
- Refresh tokens valid for 30 days
- Rate limiting on auth endpoints (max 5 attempts/minute)

---

### 3.2 Moment Management

#### 3.2.1 Moment Creation
**Requirements**
- **MM-001**: Create moment with title, description, date/time
- **MM-002**: Upload multiple media files (images, videos, documents, audio)
- **MM-003**: Auto-extract metadata (EXIF data from images)
- **MM-004**: Set emotion/mood (happy, sad, neutral, exciting, nostalgic)
- **MM-005**: Set importance level (1-5 scale)
- **MM-006**: Add tags for categorization
- **MM-007**: Set location (optional, with map integration)
- **MM-008**: Link related moments

**Acceptance Criteria**
- Support image formats: JPEG, PNG, WEBP, HEIC
- Support video formats: MP4, MOV, AVI (converted to MP4)
- Support documents: PDF, DOCX, TXT
- Support audio: MP3, WAV, M4A
- Max file size: 100MB per file
- Max 20 files per moment
- Image optimization: generate thumbnails (300px), medium (800px), full resolution
- Video processing: generate thumbnail, compress to 720p for web playback

#### 3.2.2 Moment Editing
**Requirements**
- **MM-009**: Edit all moment properties
- **MM-010**: Add/remove media files
- **MM-011**: Reorder media files
- **MM-012**: Delete moments (soft delete with 30-day recovery)

#### 3.2.3 Moment Viewing
**Requirements**
- **MM-013**: Full-screen media viewer
- **MM-014**: Image gallery with swipe/keyboard navigation
- **MM-015**: Video player with controls
- **MM-016**: Document preview (PDF inline viewer)
- **MM-017**: Audio player with waveform visualization

---

### 3.3 3D Timeline Visualization

#### 3.3.1 Galaxy Structure
**Requirements**
- **3D-001**: Moments arranged in 3D spiral/galaxy formation
- **3D-002**: Time flows along spiral (birth → present)
- **3D-003**: Each moment represented as a "bubble" (sphere)
- **3D-004**: Bubble size reflects importance (radius: 0.5-2.5 units)
- **3D-005**: Bubble color reflects emotion:
  - Happy: Gold (#FFD700)
  - Sad: Blue (#4169E1)
  - Exciting: Orange (#FF6347)
  - Nostalgic: Purple (#9370DB)
  - Neutral: Gray (#A9A9A9)
- **3D-006**: Bubbles glow/pulse based on recency (newer = stronger glow)
- **3D-007**: Semi-transparent bubbles show preview (first image thumbnail)

#### 3.3.2 Camera & Navigation
**Requirements**
- **3D-008**: Free-roam camera controls (orbit, pan, zoom)
- **3D-009**: Mouse drag to rotate view
- **3D-010**: Scroll/pinch to zoom in/out
- **3D-011**: Click bubble to select/focus
- **3D-012**: Double-click to enter moment (detail view)
- **3D-013**: Smooth camera transitions (easing: 1-2 seconds)
- **3D-014**: "Auto-tour" mode (automatic journey through timeline)
- **3D-015**: Timeline scrubber (UI overlay) for quick time navigation
- **3D-016**: Search/jump functionality (text search, date picker)

#### 3.3.3 Visual Connections
**Requirements**
- **3D-017**: Lines connecting related moments (same tags, people, locations)
- **3D-018**: Color-coded connection lines:
  - People: Green
  - Locations: Red
  - Events: Yellow
- **3D-019**: "Constellation" grouping (auto-detect clusters: school, work, travel)
- **3D-020**: Hover effects (bubble enlarges, info tooltip appears)
- **3D-021**: Particle effects for atmosphere (subtle floating particles)

#### 3.3.4 Environmental Effects
**Requirements**
- **3D-022**: Dynamic background color based on time period (gradient from dark to light)
- **3D-023**: Seasonal effects:
  - Winter (Dec-Feb): Snow particles
  - Spring (Mar-May): Flower petals
  - Summer (Jun-Aug): Sunlight rays
  - Fall (Sep-Nov): Falling leaves
- **3D-024**: Ambient soundtrack (subtle, changeable per era)
- **3D-025**: Time-of-day lighting (if moment has time data)

#### 3.3.5 Performance Optimization
**Requirements**
- **3D-026**: Level of Detail (LOD): distant bubbles use low-poly models
- **3D-027**: Frustum culling (only render visible objects)
- **3D-028**: Lazy loading: load moment details on demand
- **3D-029**: Texture compression (basis universal)
- **3D-030**: Target: 60 FPS on desktop, 30 FPS on mobile
- **3D-031**: WebGL fallback for older browsers

---

### 3.4 User Interface Components

#### 3.4.1 Main Navigation
**Requirements**
- **UI-001**: Top navbar with:
  - Logo
  - Search bar
  - View mode toggle (3D / List / Calendar)
  - User menu (profile, settings, logout)
- **UI-002**: Floating action button (FAB) for "Add Moment"
- **UI-003**: Timeline controls overlay:
  - Play/pause auto-tour
  - Speed control
  - Reset view
  - Fullscreen toggle

#### 3.4.2 Moment Detail Panel
**Requirements**
- **UI-004**: Slide-in panel from right when moment selected
- **UI-005**: Display:
  - Title (editable inline)
  - Date/time
  - Description (editable)
  - Media gallery
  - Tags
  - Location map (if available)
  - Related moments
  - Edit/delete buttons
- **UI-006**: Swipe down to close (mobile)
- **UI-007**: ESC key to close (desktop)

#### 3.4.3 Upload Interface
**Requirements**
- **UI-008**: Drag-and-drop zone
- **UI-009**: File browser button
- **UI-010**: Upload progress indicators
- **UI-011**: Image preview grid
- **UI-012**: Form fields (title, date, emotion, importance, tags)
- **UI-013**: Date picker with calendar view
- **UI-014**: Tag autocomplete (suggest existing tags)
- **UI-015**: Save as draft / Publish

#### 3.4.4 Filters & Search
**Requirements**
- **UI-016**: Left sidebar filter panel:
  - Date range slider
  - Emotion checkboxes
  - Importance slider
  - Tag multi-select
  - People filter
  - Location filter
- **UI-017**: Full-text search across titles, descriptions, tags
- **UI-018**: Search suggestions (recent searches, popular tags)
- **UI-019**: Results highlighting in 3D view

#### 3.4.5 Alternative Views
**Requirements**
- **UI-020**: List view (traditional timeline)
- **UI-021**: Calendar view (month/year grid)
- **UI-022**: Stats dashboard:
  - Total moments
  - Moments per year/month
  - Emotion distribution chart
  - Most active periods
  - Storage usage

---

### 3.5 Data Model

#### 3.5.1 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Moments table
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  moment_date TIMESTAMP NOT NULL,
  emotion VARCHAR(50), -- happy, sad, exciting, nostalgic, neutral
  importance INTEGER CHECK (importance BETWEEN 1 AND 5),
  location_name VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete
  is_draft BOOLEAN DEFAULT FALSE
);

-- Media files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  file_type VARCHAR(20), -- image, video, document, audio
  original_filename VARCHAR(255),
  storage_key VARCHAR(500) NOT NULL, -- S3 key
  thumbnail_key VARCHAR(500),
  medium_key VARCHAR(500), -- for images
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER, -- for images/videos
  height INTEGER,
  duration INTEGER, -- for videos/audio (seconds)
  metadata JSONB, -- EXIF, camera info, etc.
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7), -- hex color
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Moment-Tags junction table
CREATE TABLE moment_tags (
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (moment_id, tag_id)
);

-- Related moments table
CREATE TABLE moment_relations (
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  related_moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  relation_type VARCHAR(50), -- same_people, same_location, same_event
  PRIMARY KEY (moment_id, related_moment_id)
);

-- Indexes for performance
CREATE INDEX idx_moments_user_date ON moments(user_id, moment_date);
CREATE INDEX idx_moments_emotion ON moments(emotion);
CREATE INDEX idx_media_moment ON media_files(moment_id);
CREATE INDEX idx_tags_user ON tags(user_id);
```

#### 3.5.2 API Endpoints

**Authentication**
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/verify-email/:token - Verify email
```

**Users**
```
GET    /api/users/me               - Get current user
PUT    /api/users/me               - Update current user
DELETE /api/users/me               - Delete account
PUT    /api/users/me/avatar        - Update avatar
```

**Moments**
```
GET    /api/moments                - Get all moments (with filters)
POST   /api/moments                - Create moment
GET    /api/moments/:id            - Get moment by ID
PUT    /api/moments/:id            - Update moment
DELETE /api/moments/:id            - Delete moment (soft)
POST   /api/moments/:id/restore    - Restore deleted moment
GET    /api/moments/:id/related    - Get related moments
POST   /api/moments/:id/relate     - Create relation between moments
```

**Media**
```
POST   /api/media/upload           - Upload media file(s)
GET    /api/media/:id              - Get media file
DELETE /api/media/:id              - Delete media file
PUT    /api/media/:id/order        - Update media order
```

**Tags**
```
GET    /api/tags                   - Get all user tags
POST   /api/tags                   - Create tag
PUT    /api/tags/:id               - Update tag
DELETE /api/tags/:id               - Delete tag
GET    /api/tags/suggestions       - Get tag suggestions
```

**Timeline**
```
GET    /api/timeline/data          - Get 3D timeline data (optimized)
GET    /api/timeline/stats         - Get timeline statistics
GET    /api/timeline/search        - Search moments
```

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-001**: Page load time < 3 seconds (3G connection)
- **NFR-002**: 3D scene initialization < 2 seconds
- **NFR-003**: API response time < 500ms (p95)
- **NFR-004**: Image upload processing < 5 seconds
- **NFR-005**: Support 10,000+ moments without performance degradation

### 4.2 Security
- **NFR-006**: HTTPS only (TLS 1.3)
- **NFR-007**: CORS properly configured
- **NFR-008**: XSS protection (sanitize all user inputs)
- **NFR-009**: CSRF tokens for state-changing operations
- **NFR-010**: SQL injection prevention (parameterized queries via Prisma)
- **NFR-011**: Rate limiting (100 requests/minute per user)
- **NFR-012**: File upload validation (magic byte checking)
- **NFR-013**: Secure file storage (private S3 bucket with signed URLs)

### 4.3 Accessibility
- **NFR-014**: WCAG 2.1 Level AA compliance
- **NFR-015**: Keyboard navigation support
- **NFR-016**: Screen reader compatible (ARIA labels)
- **NFR-017**: Color contrast ratio ≥ 4.5:1
- **NFR-018**: Alternative text for all images
- **NFR-019**: 3D view not required (fallback to list view)

### 4.4 Scalability
- **NFR-020**: Horizontal scaling for backend (stateless services)
- **NFR-021**: Database connection pooling
- **NFR-022**: CDN for static assets
- **NFR-023**: Redis caching for frequent queries
- **NFR-024**: S3/CloudFront for media delivery

### 4.5 Browser Support
- **NFR-025**: Chrome 90+
- **NFR-026**: Firefox 88+
- **NFR-027**: Safari 14+
- **NFR-028**: Edge 90+
- **NFR-029**: Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

### 4.6 Monitoring & Logging
- **NFR-030**: Error tracking (Sentry)
- **NFR-031**: Performance monitoring (LogRocket)
- **NFR-032**: Server logs (Winston)
- **NFR-033**: Database query monitoring
- **NFR-034**: Uptime monitoring (99.9% SLA)

---

## 5. Development Phases

### Phase 1: MVP (8-10 weeks)
**Weeks 1-2: Setup & Infrastructure**
- Project initialization
- Database setup
- Authentication system
- Basic API structure

**Weeks 3-4: Core Moment Management**
- Create/read/update/delete moments
- Media upload (images only)
- Basic form UI

**Weeks 5-7: 3D Visualization**
- Three.js scene setup
- Basic bubble rendering
- Camera controls
- Timeline layout (spiral)

**Weeks 8-10: Polish & Integration**
- Moment detail panel
- Search functionality
- Basic filters
- Testing & bug fixes

### Phase 2: Enhanced Features (6-8 weeks)
- Video/audio/document support
- Advanced 3D effects (particles, seasonal)
- Related moments & connections
- Auto-tour mode
- Calendar/list views
- Stats dashboard

### Phase 3: Advanced Features (4-6 weeks)
- OAuth login
- Collaborative timelines (sharing)
- Export functionality (PDF, video)
- Mobile app (React Native)
- AI-powered tagging
- Advanced search

---

## 6. Testing Strategy

### 6.1 Unit Testing
- Jest for JavaScript/TypeScript
- React Testing Library for components
- Target: 80% code coverage

### 6.2 Integration Testing
- API endpoint testing with Supertest
- Database integration tests
- Media processing pipeline tests

### 6.3 E2E Testing
- Playwright for critical user flows
- Test scenarios:
  - User registration → moment creation → 3D view
  - Media upload → processing → display
  - Search → filter → navigation

### 6.4 Performance Testing
- Load testing with Artillery
- 3D scene performance profiling
- Media delivery optimization

### 6.5 Security Testing
- OWASP Top 10 vulnerability scanning
- Dependency scanning (Snyk)
- Penetration testing (Phase 2)

---

## 7. Deployment Strategy

### 7.1 Environments
- **Development**: Local Docker setup
- **Staging**: Staging server (mirrors production)
- **Production**: Cloud infrastructure (AWS/DO)

### 7.2 CI/CD Pipeline
1. Push to GitHub
2. Run tests (unit, integration)
3. Build Docker images
4. Deploy to staging (auto)
5. Manual approval for production
6. Deploy to production
7. Health checks
8. Rollback capability

### 7.3 Database Migrations
- Prisma Migrate for schema changes
- Backup before migrations
- Zero-downtime deployments

---

## 8. Documentation Requirements

### 8.1 Technical Documentation
- API documentation (Swagger)
- Database schema documentation
- Architecture diagrams
- Deployment guide
- Development setup guide

### 8.2 User Documentation
- User guide (how to use 3D timeline)
- FAQ
- Video tutorials
- Help center

---

## 9. Success Metrics

### 9.1 Technical Metrics
- API uptime: 99.9%
- Average response time: < 500ms
- Error rate: < 0.1%
- 3D scene FPS: 60 (desktop), 30 (mobile)

### 9.2 User Metrics
- User registration rate
- Moments created per user
- Media uploads per moment
- 3D view engagement time
- Return user rate (weekly)

### 9.3 Business Metrics
- User retention (30-day, 90-day)
- Storage usage per user
- Server costs per user
- Feature adoption rates

---

## 10. Risks & Mitigation

### 10.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 3D performance on mobile | High | Medium | LOD, progressive loading, fallback views |
| Large media files storage costs | High | High | Compression, CDN, tiered storage |
| Browser compatibility issues | Medium | Medium | Polyfills, WebGL fallback, progressive enhancement |
| Database scaling | Medium | Low | Proper indexing, caching, read replicas |

### 10.2 Product Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex UI overwhelming users | High | Medium | Onboarding tutorial, simpler default view |
| Slow adoption | Medium | Medium | Marketing, referral program, free tier |
| Privacy concerns | High | Low | Clear privacy policy, data encryption, GDPR compliance |

---

## 11. Future Enhancements (Post-Launch)

### 11.1 AI Features
- Auto-tagging using image recognition
- Face detection for people tracking
- Automatic moment clustering
- Suggested moment creation from photos

### 11.2 Social Features
- Share timeline with friends/family
- Collaborative timelines (family tree)
- Comments on moments
- Public vs. private moments

### 11.3 Advanced Visualization
- VR mode (WebXR)
- AR preview (mobile)
- Custom themes/skins
- Multiple timeline views (grid, map-based)

### 11.4 Export & Backup
- Export timeline as PDF book
- Video compilation generator
- Automatic cloud backup
- Import from other platforms (Google Photos, Facebook)

---

## 12. Appendices

### Appendix A: Glossary
- **Moment**: A single memory/event with associated media and metadata
- **Bubble**: 3D sphere representing a moment in the timeline
- **Galaxy**: The 3D spiral structure containing all moments
- **Constellation**: Auto-detected cluster of related moments
- **Auto-tour**: Automated camera movement through the timeline

### Appendix B: References
- Three.js Documentation: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Prisma Documentation: https://www.prisma.io/docs/

### Appendix C: Design Assets
- Wireframes: [Link to Figma]
- UI Mockups: [Link to Figma]
- Brand Guidelines: [Link to document]

---

**Document Version**: 1.0  
**Last Updated**: January 30, 2026  
**Author**: Product Team  
**Reviewers**: Engineering, Design, QA
