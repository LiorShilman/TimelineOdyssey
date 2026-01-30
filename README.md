# Timeline Odyssey 🌌

An immersive 3D web application that transforms personal life memories into an interactive, navigable galaxy of moments.

## 🎯 Features

- **3D Timeline Visualization**: Navigate your life's moments in a stunning 3D galaxy
- **Multi-Media Support**: Upload images, videos, documents, and audio
- **Smart Organization**: Auto-tagging, emotion tracking, and importance levels
- **Interactive Navigation**: Free-roam camera, auto-tour mode, and quick search
- **Visual Connections**: See relationships between moments with connecting lines
- **Seasonal Effects**: Dynamic environmental effects based on time periods
- **Alternative Views**: List, calendar, and stats dashboard views

## 🏗️ Project Structure

```
timeline-odyssey/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── 3d/       # Three.js 3D components
│   │   │   ├── ui/       # Reusable UI components
│   │   │   ├── layout/   # Layout components
│   │   │   ├── moments/  # Moment-related components
│   │   │   └── auth/     # Authentication components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand state stores
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript types
│   │   └── config/       # Configuration
│   └── prisma/           # Prisma schema & migrations
├── docker-compose.yml    # Docker services configuration
└── PRD.md               # Product Requirements Document

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timeline-odyssey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env
   # Client
   cp client/.env.example client/.env
   ```

4. **Start Docker services**
   ```bash
   npm run docker:up
   ```
   This will start PostgreSQL, Redis, and MinIO.

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Client: http://localhost:5173
   - Server: http://localhost:3001
   - MinIO Console: http://localhost:9001

### First-Time Setup

1. Create MinIO bucket:
   - Open http://localhost:9001
   - Login: minioadmin / minioadmin123
   - Create bucket named "timeline-odyssey"
   - Set bucket policy to "public" (or configure private with presigned URLs)

2. (Optional) View database with Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

## 📦 Available Scripts

### Root Level
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Client (in client/ directory)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Server (in server/ directory)
- `npm run dev` - Start server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching
- **JWT** - Authentication
- **Sharp** - Image processing
- **FFmpeg** - Video processing
- **MinIO/S3** - File storage

## 📚 Documentation

- [PRD.md](./PRD.md) - Complete Product Requirements Document
- [API Documentation](./server/docs/API.md) - API endpoints and usage (to be created)
- [Architecture](./docs/ARCHITECTURE.md) - System architecture (to be created)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test -- --watch
```

## 🐳 Docker Deployment

For production deployment:

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Three.js community for amazing 3D capabilities
- React Three Fiber for seamless React integration
- Prisma for excellent developer experience

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for preserving life's precious moments**
