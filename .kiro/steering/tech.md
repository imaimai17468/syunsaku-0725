# Technology Stack

## Core Framework & Language
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Package Manager**: Bun (preferred)

## Frontend Stack
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and server components

## Backend & Database
- **Authentication**: Supabase Auth (OAuth with GitHub/Google)
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **File Storage**: Supabase Storage (for avatar uploads)

## Development Tools
- **Code Quality**: Biome (linting, formatting, import organization)
- **Testing**: Vitest with Testing Library
- **Component Development**: Storybook
- **Git Hooks**: Lefthook for pre-commit/pre-push checks
- **Type Checking**: TypeScript compiler

## Common Commands

### Development
```bash
bun run dev          # Start development server
bun run build        # Production build
bun run start        # Start production server
bun run typecheck    # TypeScript type checking
```

### Code Quality
```bash
bun run check        # Run Biome linter/formatter checks
bun run check:fix    # Auto-fix with Biome (includes unsafe fixes)
bun run format       # Check formatting
bun run format:fix   # Auto-format code
```

### Database
```bash
bun run db:generate  # Generate Drizzle migrations
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Drizzle Studio
bun run db:typegen   # Generate Supabase types
```

### Testing & Documentation
```bash
bun run test         # Run tests with Vitest
bun run storybook    # Start Storybook dev server
```

## Configuration Notes
- Uses `@/` path alias for absolute imports from `src/`
- Biome configured with tab indentation and double quotes
- Strict TypeScript with no explicit `any` allowed
- Tailwind classes automatically sorted via Biome
