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

export const kliniu: Project = {
  id: 'kliniu',
  slug: 'kliniu',
  name: 'Kliniu',
  tagline: 'E-commerce platform for institutional hygiene and cleaning dispensing solutions.',
  summary:
    'Full-featured B2B e-commerce platform for hygiene products (dispensers, paper, soap) with an admin panel, AI chatbot, ERP/CRM integrations, production tracking, and volume pricing.',
  description:
    'Kliniu is a production-grade e-commerce platform built with Next.js 16, React 19, Prisma + PostgreSQL (Supabase), and Tailwind CSS v4. It serves as a B2B storefront for institutional hygiene products — liquid dispensers, paper dispensers, soap dispensers, and related accessories. The platform includes a full product catalog with rich categories (custom banners, buying guides, color variants, gallery, video), shopping cart, checkout, order management with Odoo ERP sync, a 15-module admin panel, AI chatbot (OpenAI) for product discovery, image search, volume pricing tiers, commercial quotations with tax configuration, production management (machines, runs, quality tracking), production order planning, marketing campaign tracking, seller cost configuration, customer loyalty points, granular user permissions, Kommo CRM integration, WhatsApp sharing, and responsive mobile-first design.',
  status: PROJECT_STATUS.Production,
  featured: false,
  public: true,
  startedAt: '2026-05-13',
  completedAt: null,
  lastUpdated: '2026-07-09',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Prisma', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Supabase', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'OpenAI', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'bcryptjs', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'JWT (jose)', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Odoo', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Kommo CRM', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Playwright', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'ESLint', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'react-icons', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.Monorepo,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
  ],
  features: [
    {
      title: 'Product Catalog',
      description:
        'Full product catalog with categories, brands, SKU, OEM references, alternative references, gallery images, color variants, video, technical specs, and rich category metadata (custom banners, hero images, buying guides).',
    },
    {
      title: 'Shopping Cart',
      description:
        'Client-side cart supporting individual products and combos, quantity management, persistent storage.',
    },
    {
      title: 'Checkout',
      description:
        'Complete checkout flow with shipping address, department/city selection, order summary, Odoo sync.',
    },
    {
      title: 'Order Management',
      description:
        'Full order lifecycle with status tracking (PENDING, PAID, CANCELLED), shipping status (PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED), admin notes, carrier/tracking, Odoo synchronization.',
    },
    {
      title: 'Admin Panel',
      description:
        'Single-page admin application (/admin) with product CRUD, order management, inventory adjustments, image upload with auto-compression to WebP, color variants editor, technical specs editor.',
    },
    {
      title: 'Panel (Seller Dashboard)',
      description:
        '15-module commercial panel: dashboard, orders, products, metrics, campaigns, costs, price calculator, quotations, production, Odoo, users, banners, combos, outlet. Granular per-module permissions.',
    },
    {
      title: 'Product Management',
      description:
        'Full CRUD for products with image upload, auto-compression to WebP, gallery management, color variants (up to 4 images per variant), technical specifications, YouTube video integration.',
    },
    {
      title: 'Category Management',
      description:
        'Rich category system with metadata: color theme, icon, banner images (desktop/mobile), hero banners, buying guides, benefits, copy text. Categories: dispensers for liquids, paper/towel/napkin, soap, accessories, and more.',
    },
    {
      title: 'Banner System',
      description:
        'Editable banner system with unique keys covering home hero (3 slides), features strip, advisory CTA, insumos CTA, and category-specific banners. Responsive variants (desktop/mobile). Live preview in panel.',
    },
    {
      title: 'Price Calculator',
      description:
        'Sale calculator for sellers: product cost + shipping + picking + commission + margin + campaign cost. Calculates final sale price with detailed breakdown.',
    },
    {
      title: 'Commercial Quotations',
      description:
        'Full quotation system (cotizaciones) with auto-numbering (COT-AAAA-NNNNNN), status workflow (DRAFT -> SENT -> APPROVED/REJECTED/EXPIRED), tax configuration (reteICA, reteFuente, IVA), product snapshots, conversion to orders. PDF generation (Playwright, reserved).',
    },
    {
      title: 'AI Chatbot',
      description:
        'OpenAI-powered product finder with catalog snapshot, Levenshtein distance for typo-tolerant matching, category-aware suggestions, product cards with prices and links.',
    },
    {
      title: 'Image Search',
      description:
        'Search products by uploading an image. Uses AI/vision for product matching.',
    },
    {
      title: 'Volume Pricing',
      description:
        'Per-product tiered volume discounts at 12, 48, and 100+ units with configurable unit prices per tier.',
    },
    {
      title: 'Combos',
      description:
        'Product bundles with dedicated SKU, pricing, images, and cart support. Featured on home page with carousel.',
    },
    {
      title: 'Campaign Management',
      description:
        'Marketing campaign tracking with daily entries (messages, transactions, ad spend, daily sales). Platform support for Meta Ads. Lead tracking, ROI calculation.',
    },
    {
      title: 'Seller Cost Config',
      description:
        'Per-seller cost configuration including production cost, advertising, shipping, packing, collection, contingencies, fixed costs, and return percentage.',
    },
    {
      title: 'Production Management',
      description:
        'Machine catalog (6 injection molding machines), production run registration with operator assignment, material tracking, injection parameters (weight, cycle, temperature), quality control with live summary (good pieces, quality percentage). Pure calculator pattern — derived fields never persisted.',
    },
    {
      title: 'Production Orders',
      description:
        'Production planning with order lifecycle (DRAFT -> APPROVED -> IN_PRODUCTION -> COMPLETED -> CANCELLED). Product catalog items with quantities, destination tracking, plant instructions. Integration with production runs.',
    },
    {
      title: 'Outlet Management',
      description:
        'Discounted/outlet product management within the commercial panel.',
    },
    {
      title: 'Odoo ERP Integration',
      description:
        'Bidirectional order sync with Odoo ERP. Product catalog sync, order creation, sync status tracking (NOT_SYNCED, SYNCED, FAILED), error logging and retries.',
    },
    {
      title: 'Kommo CRM Integration',
      description:
        'CRM integration for lead and contact management. OAuth2 authentication, custom field mapping (phone, WhatsApp, company, city, customer level, order details), webhook support.',
    },
    {
      title: 'WhatsApp Integration',
      description:
        'Product sharing via WhatsApp with auto-generated messages including product name, SKU, OEM reference, price, and URL. Advisor CTA throughout the site.',
    },
    {
      title: 'Loyalty Points & Rewards',
      description:
        'Customer loyalty program with points earning and redemption. Customer levels (AQUA, CORAL, OCEAN, DIAMOND_SEAL), bonus balance, point transactions, reward catalog with stock management.',
    },
    {
      title: 'User Management & Permissions',
      description:
        'Role-based access control (CUSTOMER, SELLER, ADMIN, PACKING, SUPERADMIN). Granular per-module permissions (view, create, edit, delete) for all 15 panel modules. Default permission matrix per role.',
    },
    {
      title: 'Inventory Management',
      description:
        'Stock tracking with minimum stock alerts, inventory movements history (created, adjustment, order deduction), quick adjustments from admin panel, out-of-stock and low-stock indicators.',
    },
    {
      title: 'Metrics Dashboard',
      description:
        'Business metrics and KPIs within the commercial panel.',
    },
    {
      title: 'User Accounts',
      description:
        'Customer registration, login (email/password, JWT sessions), profile management, order history, loyalty points dashboard.',
    },
    {
      title: 'Image Upload & Processing',
      description:
        'Client-side image compression to WebP (1200px max, 82% quality) before Supabase Storage upload. Multi-image gallery, color variant images, automatic format conversion.',
    },
  ],
  challenges: [
    {
      title: 'Volume pricing model',
      description:
        'Implementing per-product tiered pricing (12, 48, 100+ units) with different unit prices for each tier across 30+ products. Prices come from external supplier Excel.',
      resolution:
        'Centralized PRODUCT_VOLUME_PRICES lookup table in lib/volume-discounts.ts with tier structure per product slug. Frontend calculates discounted price reactively based on cart quantity.',
    },
    {
      title: 'Odoo ERP bidirectional sync',
      description:
        'Keeping orders and products in sync between Kliniu and an external Odoo ERP instance. Sync failures, retries, race conditions, and error recovery needed robust handling.',
      resolution:
        'Sync status enum (NOT_SYNCED, SYNCED, FAILED) on each order. Odoo service in lib/odoo.ts with retry logic, error logging, and manual re-sync from panel. Product sync via XML-RPC (jsonrpc).',
    },
    {
      title: 'Production quality calculation matching Excel',
      description:
        'Replacing a manual Excel-based production tracking system (PLANILLA DIRIA) with 230+ rows of historical data. Formulas needed exact reproduction, and one row had a manual error that diverged from the formula.',
      resolution:
        'Pure calculator (lib/production-calculator.ts) with exact formula reproduction (goodPieces = produced - damaged, qualityPercentage = ((goodPieces - nonConforming) / produced) * 100). QA verified 5 real Excel rows matched. The one erroneous row documented but not reproduced.',
    },
    {
      title: 'Granular permission system',
      description:
        '15 panel modules each needing view/create/edit/delete permissions, enforced at both frontend (sidebar filtering, button visibility) and backend (API guards). Different default matrices per role.',
      resolution:
        'Permission matrix (lib/permission-defaults.ts) per role with PanelModule enum. requirePermission/requireAdmin/requireSuperAdmin helpers in lib/permissions.ts. UI filters sidebar and actions based on effective permissions.',
    },
    {
      title: 'Image management at scale',
      description:
        'Product images from mobile uploads can exceed 15MB. Gallery images, color variant images, and banner images across multiple breakpoints (desktop/mobile) needed optimization.',
      resolution:
        'Client-side WebP compression before upload (compressImage in admin/page.tsx: max 1200px, 82% quality). Multiple image slots (main + 3 extra) plus color variant images (up to 4 per variant). Banner system with separate desktop/mobile fields.',
    },
    {
      title: 'AI chatbot product matching',
      description:
        'Building a context-aware product finder that handles typos, understands category context, and returns relevant results from a catalog of 100+ products.',
      resolution:
        'Levenshtein distance algorithm for typo-tolerant matching. Catalog snapshot pre-computed with all products and categories. Context-aware suggestions based on matched vs non-matched terms. OpenAI integration for natural language understanding.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Derived fields never persisted',
      context:
        'Production runs and quotations require calculated fields (goodPieces, qualityPercentage, lineTotal, subtotal, taxes, totals). Storing derived values creates consistency risks when source data changes.',
      decision:
        'All derived fields computed by pure functions in dedicated calculator files (quotation-calculator.ts, production-calculator.ts). Never stored in database columns. Recalculated on every read.',
      reasoning:
        'Pure functions guarantee deterministic output for same inputs. Eliminates sync issues between raw data and calculated values. Specs explicitly check no derived columns in schema.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Product snapshots in quotations',
      context:
        'Quotations must preserve product price and name at the time of quotation, even if the product catalog changes later. But images should stay current.',
      decision:
        'Snapshot unitPrice and name in QuotationItem at creation time. Image resolved from Product.image at read time (or manualImageUrl for free-text items).',
      reasoning:
        'Price and name are contractual (quotation represents a commercial offer at a point in time). Image is illustrative and benefits from staying current.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'ProductionOrder requires catalog products',
      context:
        'ProductionOrder plans what to manufacture. Unlike quotations (which allow free-text items), manufacturing requires a known product with existing specs and BOM data.',
      decision:
        'ProductionOrderItem.productId is required (non-nullable). Product name, reference, and image are read by join to Product at read time — never snapshotted.',
      reasoning:
        'A production order represents an executable manufacturing plan. Every item must be a known product. Historical accuracy is less important than having current product data for production.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'State machine for document workflows',
      context:
        'Quotations and ProductionOrders have defined lifecycles with allowed transitions. Free-form state manipulation leads to inconsistent documents.',
      decision:
        'Explicit enum statuses with backend transition guards (assertDraft, assertSent, etc.). Only allowed transitions accepted, with descriptive error codes.',
      reasoning:
        'State machines enforce document integrity at the API level, not just UI. The pattern is reusable across Quotation and ProductionOrder with the same guard architecture.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Supabase for auth and storage',
      context:
        'E-commerce platform needs authentication (email/password, JWT sessions) and image storage. Building custom solutions would add maintenance burden.',
      decision:
        'Use Supabase Auth for session management and Supabase Storage for product/banner images. PostgreSQL via Supabase pooler for database.',
      reasoning:
        'Supabase provides auth, storage, and PostgreSQL in one platform. JWT sessions with cookies for admin panel. Storage bucket product-images with public URLs.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Odoo integration as async service',
      context:
        'Orders created in Kliniu must sync to Odoo ERP. Direct synchronous calls would block the checkout flow and make the platform dependent on Odoo availability.',
      decision:
        'Order created first in Kliniu DB, then async Odoo sync with status tracking (NOT_SYNCED, SYNCED, FAILED). Manual re-sync available from panel.',
      reasoning:
        'Decouples platform availability from ERP availability. Sync failures are recoverable without data loss. Error logging enables monitoring.',
      impact: DECISION_IMPACT.High,
    },
  ],
  lessonsLearned: [
    {
      title: 'Pure calculator pattern prevents data inconsistency',
      description:
        'Building quotation-calculator.ts and production-calculator.ts as pure functions (no DB access, deterministic) eliminated all sync bugs between raw data and calculated fields. Same inputs always produce same outputs regardless of when/where calculation runs.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'State machines make document workflows predictable',
      description:
        'Explicit status enums with backend transition guards (assertDraft, INVALID_TRANSITION) prevented invalid state changes at the API level. The same guard pattern was reused across Quotations and ProductionOrders without modification.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Supabase storage requires client-side optimization',
      description:
        'Raw image uploads from mobile devices reached 15MB+. Implementing client-side WebP compression (compressImage) before upload reduced storage costs by ~80% and improved page load times significantly.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'Excel-to-system migration requires per-row QA',
      description:
        'During production tracking migration, 1 of 230 Excel rows had a manually entered value that diverged from the formula. Automated migration without per-row QA would have reproduced the error silently.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'Granular permissions need both frontend and backend enforcement',
      description:
        'UI-only permission hiding is trivially bypassed. Backend-only enforcement confuses users (buttons appear but API calls fail). Enforcing at both layers with shared permission logic provides security and good UX.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: {
    commits: 194,
    contributors: 1,
    durationWeeks: 8,
    modules: 15,
    tests: null,
    coverage: null,
  },
  media: [],
  links: {},
  role: {
    title: 'Software Engineer & Full-Stack Developer',
    responsibilities: [
      'Full-stack development: Next.js e-commerce platform from scratch',
      'Database schema design (Prisma + PostgreSQL, 20+ models)',
      'Admin panel and commercial panel (15 modules with permissions)',
      'Odoo ERP integration and Kommo CRM integration',
      'AI chatbot implementation (OpenAI + Levenshtein matching)',
      'Production management system with pure calculator architecture',
      'Quotation system with state machine lifecycle',
      'Image upload pipeline with auto-compression to WebP',
      'Volume pricing model implementation',
      'User management and granular permission system',
    ],
  },
  tags: [
    'e-commerce',
    'nextjs',
    'typescript',
    'tailwind-v4',
    'prisma',
    'supabase',
    'openai',
    'odoo',
    'production-management',
    'admin-panel',
    'b2b',
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
