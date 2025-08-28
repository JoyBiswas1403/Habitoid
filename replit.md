# Overview

HabitFlow is a comprehensive habit tracking application that combines modern web technologies with gamification and AI-powered insights. The platform helps users build and maintain positive habits through advanced tracking features, Pomodoro timer integration, achievement systems, and personalized AI recommendations. Built as a full-stack application with React frontend and Express backend, it leverages PostgreSQL for data persistence and includes social features like leaderboards and achievement sharing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit's OIDC-based authentication system with Passport.js
- **Session Management**: express-session with PostgreSQL session store
- **API Design**: RESTful endpoints with comprehensive error handling middleware

## Database Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for database versioning
- **Connection**: Connection pooling using @neondatabase/serverless

## Core Data Models
- **Users**: Profile management with leveling system and streak tracking
- **Habits**: Categorized habits with frequency settings and target values
- **Habit Logs**: Daily completion tracking with timestamps
- **Pomodoro Sessions**: Focus timer sessions with duration and completion status
- **Achievements**: Gamification system with unlockable rewards
- **AI Insights**: Weekly performance analysis and recommendations

## Authentication & Security
- **Provider**: Replit OIDC integration for secure authentication
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Route-level middleware protecting authenticated endpoints
- **CSRF Protection**: Built-in session-based CSRF protection

## Business Logic Architecture
- **Habit Tracking**: Daily completion logging with streak calculation
- **Gamification**: Point system, leveling, and achievement unlocking
- **Timer System**: Pomodoro technique implementation with session types
- **Analytics**: Contribution graphs and performance metrics
- **Social Features**: Leaderboards and user rankings

# External Dependencies

## Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting for production data
- **OpenAI API**: GPT-5 integration for generating personalized habit insights and recommendations
- **Replit Authentication**: OIDC-based user authentication and profile management

## Key Libraries
- **Frontend**: React, Vite, TanStack Query, Wouter, React Hook Form, Zod, Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Express, Passport.js, Drizzle ORM, connect-pg-simple
- **Development**: TypeScript, ESBuild, PostCSS, Autoprefixer

## Development Tools
- **Build System**: Vite for frontend bundling, ESBuild for backend compilation
- **Type Safety**: TypeScript throughout the stack with strict configuration
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Development Server**: Hot module replacement and runtime error overlays for Replit environment