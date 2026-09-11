import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  OWNERSHIP_TYPE,
  PROJECT_STATUS,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from './project.enums';
import type { Project } from './project.types';

export const vevi: Project = {
  id: 'vevi',
  slug: 'vevi',
  name: 'Vevi',
  tagline: 'Social video platform — TikTok/Reels architecture designed for scale.',
  summary:
    'A full-stack social video platform with a NestJS backend, React Native mobile app, async video processing pipeline (ffmpeg + BullMQ + Redis), and JWT auth. Built with Turborepo monorepo, Prisma + Supabase PostgreSQL, and S3-compatible storage (MinIO + Supabase Storage).',
  description:
    'Vevi is a social video platform inspired by TikTok/Reels architecture. No production-scale load measurement is documented here. It is organized as a Turborepo monorepo with three packages: backend (NestJS 10 with 13 feature modules: auth, posts, feed, explore, users, comments, likes, followers, media, search, notifications, saved-posts, shares, admin), mobile (React Native 0.85.3 with React Navigation, React Query, Zustand, Reanimated 4.4), and shared (types, validators, enums). The video pipeline uses ffmpeg for server-side compression (libx264, CRF 23, 1080p max, 30fps cap) with thumbnail generation, BullMQ + Redis for async job processing, Supabase Storage for video hosting, and MinIO for S3-compatible image storage. Auth uses custom JWT with refresh token rotation and Passport strategies (local, Google OAuth, Apple Sign In). The API includes Swagger documentation, rate limiting, cursor-based pagination, and global JwtAuthGuard with @Public() decorator pattern. Infrastructure runs on Docker (PostgreSQL, Redis, MinIO) with Supabase Cloud for production database.',
  status: PROJECT_STATUS.Development,
  featured: false,
  public: true,
  startedAt: '2026-05-28',
  completedAt: null,
  lastUpdated: '2026-07-09',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'NestJS', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React Native', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Prisma', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Redis', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Working },
    { name: 'BullMQ', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'ffmpeg', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Supabase', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'MinIO', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Docker', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Zustand', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Zod', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'JWT', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Swagger', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'React Query', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Turborepo', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'AWS SDK', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.Monorepo,
    ARCHITECTURE_PATTERN.CleanArchitecture,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
  ],
  features: [
    {
      title: 'User Authentication',
      description:
        'Custom JWT authentication with access tokens (15m) and refresh tokens (7d) with rotation. bcrypt password hashing (12 rounds). Session management with multi-device support. Social auth via Google OAuth and Apple Sign In (Passport strategies, credentials pending).',
    },
    {
      title: 'Video Upload & Processing Pipeline',
      description:
        'Server-side video processing pipeline: ffprobe metadata extraction, ffmpeg compression (libx264, CRF 23, 1080p max, 30fps cap, AAC 128k audio, faststart), thumbnail generation (s.1, 480px). Uploads to Supabase Storage private bucket. Tracks compression metrics (original, compressed, saving%, processing time).',
    },
    {
      title: 'Image Upload (Presigned URLs)',
      description:
        'Direct client-to-storage image uploads via S3 presigned URLs. No backend bottleneck. MinIO for local development (S3-compatible), migration path to AWS S3. Signed GET URLs for secure delivery.',
    },
    {
      title: 'Feed',
      description:
        'Cursor-based paginated feed of posts from followed users. Chronological ordering with path to ML-based ranking. Signed media URLs generated on-demand per feed load (1h expiry).',
    },
    {
      title: 'Explore Feed',
      description:
        'Public discover feed for non-followed content. Cursor-based pagination. Available without authentication (@Public()).',
    },
    {
      title: 'Post Creation',
      description:
        'Create posts with text, images, or video. Supports multiple media attachments per post. Media types: IMAGE, VIDEO. Zod validation.',
    },
    {
      title: 'Comments',
      description:
        'Full CRUD comments on posts. Public read endpoints. Nested comment support ready.',
    },
    {
      title: 'Likes',
      description:
        'Toggle like/unlike on posts. Public read endpoints for like counts and lists.',
    },
    {
      title: 'Follow / Unfollow',
      description:
        'Follow/unfollow users with bidirectional relationship tracking. Public endpoints for follower/following lists.',
    },
    {
      title: 'User Profiles',
      description:
        'User profiles with _count (posts, followers, following) and isFollowing status for authenticated requests.',
    },
    {
      title: 'Search',
      description:
        'Full-text search across users and posts. Public endpoint (@Public()).',
    },
    {
      title: 'Saved Posts',
      description:
        'Bookmark/save posts for later viewing. Dedicated backend module.',
    },
    {
      title: 'Notifications',
      description:
        'In-app notification infrastructure with BullMQ job queue. Module scaffolded, push notification delivery pending.',
    },
    {
      title: 'Admin Dashboard',
      description:
        'Admin module for user management, content moderation, and platform administration.',
    },
    {
      title: 'BullMQ Job Queue System',
      description:
        'Redis-backed job queues for async processing: video (compress, thumbnail, upload), notifications (push/email), moderation (AI content review). Delayed jobs, retries with backoff, concurrency control, progress reporting.',
    },
    {
      title: 'Rate Limiting',
      description:
        'Global rate limiting via @nestjs/throttler: 100 requests per 60 seconds. Configurable TTL and limit.',
    },
    {
      title: 'Swagger API Documentation',
      description:
        'Full OpenAPI/Swagger documentation at /docs. All endpoints documented with NestJS Swagger decorators.',
    },
    {
      title: 'Docker Infrastructure',
      description:
        'Local development environment via Docker Compose: PostgreSQL 16 (database), Redis 7 (queue + cache), MinIO (S3-compatible image storage). Healthcheck-configured services.',
    },
    {
      title: 'React Native Mobile App',
      description:
        'Cross-platform mobile app (iOS + Android) built with React Native 0.85.3. React Navigation (native stack + bottom tabs), React Query for API data, Zustand for client state, Reanimated 4.4 for animations, react-native-video for playback, react-native-image-picker for uploads.',
    },
  ],
  challenges: [
    {
      title: 'React Native 0.85.3 + Reanimated 4.4 compatibility',
      description:
        'React Native 0.85.3 uses the new Fabric architecture. react-native-reanimated 3.x was incompatible, causing build failures in Xcode. The upgrade to 4.4.0 required patching three native module files to fix Hermes RuntimeAdapter and UIKit API changes.',
      resolution:
        'Upgraded to react-native-reanimated 4.4.0 + react-native-worklets 0.9.1. Patched ReanimatedHermesRuntime.cpp (removed override), NativeMethods.mm (replaced RCTScrollView), and REASwizzledUIManager.mm (intrinsicContentSize workaround). Documented all patches in AGENTS.md.',
    },
    {
      title: 'Supabase migration and IPv6 dependency',
      description:
        'Direct PostgreSQL connection to Supabase requires IPv6, which was not available locally. Prisma migrations could not run against Supabase directly.',
      resolution:
        'Used Supavisor session pooler (aws-1-us-east-2.pooler.supabase.com:5432) with postgres.[PROJECT_REF] user for IPv4-compatible connections. Supabase CLI (supabase db push) for migrations as alternative. Documented both approaches.',
    },
    {
      title: 'Monorepo Metro bundler configuration',
      description:
        'React Native Metro bundler does not natively resolve workspace dependencies in a Turborepo monorepo. Shared packages and node_modules resolution across workspaces required explicit configuration.',
      resolution:
        'Configured metro.config.js with watchFolders pointing to packages/shared and root node_modules. Added babel-plugin-module-resolver for path aliases. Set up hoisting-compatible resolution.',
    },
    {
      title: 'Video processing as async job',
      description:
        'ffmpeg video compression is CPU-intensive and blocks the API event loop. Processing must be async, retryable, and horizontally scalable without affecting API response times.',
      resolution:
        'Offloaded all video processing to BullMQ queue with Redis persistence. In-process worker for development (single node), dedicated worker processes for production scaling. Configurable concurrency, retries with exponential backoff.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'JWT Auth instead of Supabase Auth',
      context:
        'Supabase Auth is tightly coupled to their ecosystem. Custom session management, multi-device control, auth provider migration flexibility, and fine-grained rate limiting were required.',
      decision:
        'Implement custom JWT authentication with access + refresh token rotation using NestJS Passport. Supabase used only as PostgreSQL provider and storage backend.',
      reasoning:
        'Full control over session management, ability to migrate auth providers without DB changes, multi-device session control, fine-grained rate limiting per user.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'ffmpeg server-side instead of client-side',
      context:
        'Video compression can run on client (mobile) or server. Mobile devices have limited battery and CPU, and compression quality varies by device.',
      decision:
        'ffmpeg compression on server with consistent preset (libx264, CRF 23, 1080p max, 30fps cap). Async via BullMQ queue to avoid blocking API.',
      reasoning:
        'Consistent quality regardless of device, upgradeable compression algorithms without app updates, horizontal scaling via multiple workers, access to faster hardware (GPU encoding future).',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Dynamic signed URLs instead of public URLs',
      context:
        'Media files need access control. Public URLs expose storage bucket names and paths, cannot be revoked per-user, and create long-lived leakable URLs.',
      decision:
        'Generate signed URLs on-demand for every media read (1h expiry). Same mechanism for both Supabase Storage (createSignedUrl) and MinIO (S3 getSignedUrl).',
      reasoning:
        'Zero exposure of storage infrastructure, URL expiration forces re-authorization, per-user revocation at API level, works identically across both storage providers.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'BullMQ + Redis for async job processing',
      context:
        'Video compression is CPU-intensive and must not block the API. The system needs retries, delayed jobs, concurrency control, and progress reporting.',
      decision:
        'BullMQ on top of Redis for all async job queues (video processing, notifications, moderation).',
      reasoning:
        'Delayed jobs, retries, rate limiting, worker concurrency control, job progress reporting, reliable queue persistence via Redis already in the stack for caching and rate limiting.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'MinIO for images + Supabase Storage for videos',
      context:
        'Images are smaller, more frequent, and don\'t need async processing. Videos are large and require the CDN/S3-compatible API of Supabase Storage.',
      decision:
        'Dual storage: Supabase Storage (private bucket) for videos, MinIO (S3-compatible local) for images. Both use the same signed URL pattern.',
      reasoning:
        'MinIO zero-cost in development, no network latency for local image uploads, images uploaded directly via presigned URLs (no backend bottleneck). Supabase Storage provides built-in CDN (Cloudflare), S3-compatible API for future migration.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Global JwtAuthGuard + @Public() decorator',
      context:
        'Most endpoints require authentication. Per-route guards are repetitive and easy to forget, creating security gaps.',
      decision:
        'Register JwtAuthGuard globally in app.module.ts. Mark public endpoints with @Public() decorator that sets IS_PUBLIC_KEY metadata.',
      reasoning:
        'Less boilerplate than per-route guards, authentication is opt-out rather than opt-in (harder to forget), single guard registration in app.module.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Cursor pagination over offset',
      context:
        'Offset pagination becomes O(n) at scale and produces inconsistent results when rows are inserted/deleted between pages.',
      decision:
        'Cursor-based pagination for all list endpoints (feed, comments, likes, followers, search results).',
      reasoning:
        'O(1) consistent pagination regardless of table size, stable results under concurrent writes, required at scale for feed and search.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Zod over class-validator',
      context:
        'Validation library needed for both backend (NestJS pipes) and shared package consumed by React Native. class-validator is NestJS-native but harder to share with frontend.',
      decision:
        'Zod for all validation schemas, shared via @vevi/shared package. ZodValidationPipe for NestJS integration.',
      reasoning:
        'Lighter than class-validator, composable schemas, shared with frontend without duplication, first-class TypeScript inference.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'RN 0.85.3 new architecture requires bleeding-edge reanimated',
      description:
        'React Native 0.85.3 Fabric API is incompatible with react-native-reanimated 3.x. The upgrade to 4.4.0 fixed the issue but required patching three native files. This should be verified at RN version upgrade time before assuming compatibility.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'Supabase pooler over direct connection for IPv4 environments',
      description:
        'Supabase direct PostgreSQL connection requires IPv6, which is not available in many local development environments. The Supavisor session pooler provides IPv4-compatible connections and should be the default connection method.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'Global auth guard reduces security gaps',
      description:
        'Registering JwtAuthGuard globally and marking public endpoints with @Public() decorator made auth opt-out instead of opt-in. This eliminated the risk of forgetting auth on new endpoints and reduced boilerplate.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Presigned URL pattern removes backend bottleneck',
      description:
        'Using presigned URLs for image uploads allowed clients to upload directly to MinIO/Supabase Storage without going through the NestJS API. This eliminated a potential bottleneck and reduced server load significantly.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Turborepo with React Native requires explicit Metro config',
      description:
        'React Native Metro bundler does not automatically resolve Turborepo workspace dependencies. watchFolders and extraNodeModules in metro.config.js are required for monorepo support, along with hoisting-compatible babel plugins.',
      category: LESSON_CATEGORY.Tooling,
    },
  ],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [],
  links: {},
  role: {
    title: 'Software Engineer & Full-Stack Developer',
    responsibilities: [
      'Full-stack development: NestJS backend + React Native mobile app',
      'Video processing pipeline design (ffmpeg, BullMQ, Redis)',
      'JWT authentication system with refresh token rotation',
      'Database schema design (Prisma + PostgreSQL, 15+ tables)',
      'Storage architecture (Supabase Storage + MinIO)',
      'Monorepo setup with Turborepo and npm workspaces',
      'Docker infrastructure (PostgreSQL, Redis, MinIO)',
      'React Native 0.85.3 migration and Reanimated 4.4 upgrade',
      'API design with Swagger documentation',
      'Social auth integration (Google, Apple) with Passport',
    ],
  },
  tags: [
    'social-media',
    'nestjs',
    'react-native',
    'typescript',
    'video-processing',
    'ffmpeg',
    'bullmq',
    'redis',
    'supabase',
    'minio',
    'docker',
    'jwt',
    'turborepo',
  ],
  relationships: {
    relatedProjects: ['command-center'],
    relatedArticles: [],
    relatedSkills: [],
  },
  metadata: { version: 1 },
  ownership: {
    type: OWNERSHIP_TYPE.Personal,
    confidential: false,
  },
};
