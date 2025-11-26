# Dyke Night Boston

A Next.js 16 website for Dyke Night Boston, a community event organization.

## Features

- Next.js 16 with App Router
- PayloadCMS for content management
- ISR (Incremental Static Regeneration) for optimal performance
- PostgreSQL database via Supabase
- Tailwind CSS v4 for styling
- Germania One font
- Black, white, and red color scheme

## Pages

- **Home** - Displays upcoming events
- **About** - Information about Dyke Night Boston
- **Events** - List of upcoming and past events
- **Rules** - Community rules and code of conduct
- **Flagging** - Flagging policy and safety information

## Setup

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Supabase CLI (for local development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment variables:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your configuration:
   - Generate `PAYLOAD_SECRET`: `openssl rand -base64 32`
   - Generate `REVALIDATE_SECRET`: `openssl rand -base64 32`
   - Set `DATABASE_URI` (use Supabase CLI for local development)

5. Start Supabase (for local development):
   ```bash
   pnpm db:start
   ```

6. Get your local database connection string:
   ```bash
   pnpm db:status
   ```
   Update `DATABASE_URI` in `.env` with the connection string.

7. Start the development server:
   ```bash
   pnpm dev
   ```

8. Access the admin panel at `http://localhost:3000/admin`

## Scripts

- `pnpm dev` - Start development server with Next.js and Supabase
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:start` - Start local Supabase
- `pnpm db:stop` - Stop local Supabase
- `pnpm db:status` - Show Supabase status
- `pnpm db:reset` - Reset Supabase database

## Project Structure

```
├── app/
│   ├── (app)/          # Main app routes
│   │   ├── about/      # About page
│   │   ├── events/     # Events page
│   │   ├── rules/      # Rules page
│   │   ├── flagging/   # Flagging page
│   │   ├── layout.tsx  # App layout with Navigation
│   │   └── page.tsx    # Home page
│   ├── (payload)/      # PayloadCMS admin
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   └── layout.tsx       # Root layout
├── components/         # React components
│   ├── ui/             # UI components
│   ├── EventCard.tsx   # Event card component
│   ├── Footer.tsx      # Footer component
│   └── Navigation.tsx  # Navigation component
├── lib/                # Utility functions
│   ├── payload.ts      # PayloadCMS client
│   └── revalidate.ts   # Cache revalidation
├── payload/            # PayloadCMS configuration
│   └── collections/    # PayloadCMS collections
└── payload.config.ts   # PayloadCMS config
```

## ISR (Incremental Static Regeneration)

The site uses ISR for optimal performance:

- Homepage revalidates every hour (3600s)
- Events page revalidates every 2 hours (7200s)
- On-demand revalidation via PayloadCMS hooks
- Cache tags: `homepage`, `events-page`, `events`, `event-{slug}`

## Color Scheme

- **Primary Red**: #DC2626
- **Background**: White (#FFFFFF)
- **Text**: Black (#000000)
- **Accents**: Red variations

## Font

- **Germania One** - Loaded from Google Fonts

## License

All rights reserved.

