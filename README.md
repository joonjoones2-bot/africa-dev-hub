# LinkDevsOrg

LinkDevsOrg is a platform designed to bridge the gap between learning and working for African tech talent. It connects recent graduates with real-world projects, experienced mentors, and employers who value proven skills and a "proof-of-work" portfolio over traditional credentials.

The platform provides distinct dashboard experiences tailored for three key user roles: Graduates, Mentors, and Employers.

## Key Features

### For Graduates
*   **Profile Building**: Create a detailed profile showcasing skills, education, and areas of interest.
*   **Project Marketplace**: Discover and apply to real-world projects posted by mentors.
*   **Mentorship**: Find and connect with experienced mentors for guidance.
*   **Proof-of-Work Portfolio**: Submit completed projects for verification by mentors, building a credible portfolio.
*   **Skill Progression**: Track your growth, earn skill badges, and see your progress across different technologies.
*   **Public Portfolio**: Share a unique portfolio page with potential employers, highlighting verified project completions and feedback.

### For Mentors
*   **Project Creation**: Design and post projects for graduates to work on.
*   **Mentorship Management**: Review and accept mentorship requests from aspiring developers.
*   **Work Verification**: Review submitted projects, provide constructive feedback, and verify completions.
*   **Student Tracking**: Monitor the progress of your mentees.

### For Employers
*   **Talent Discovery**: Search and filter a pool of vetted graduates based on skills, experience, and project work.
*   **Post Opportunities**: Create and post job or internship opportunities.
*   **Candidate Bookmarking**: Save and track promising candidates for future roles.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Backend & Database**: Supabase (Authentication, PostgreSQL Database, Realtime Subscriptions)
*   **Styling**: Tailwind CSS with shadcn/ui component library
*   **Routing**: React Router
*   **State Management**: TanStack Query (React Query)
*   **Forms**: React Hook Form
*   **Animations**: Framer Motion

## Project Structure

The project is organized to separate concerns and maintain a scalable architecture.

```
src/
├── components/     # Reusable UI components (including shadcn/ui) and layout elements
├── contexts/       # React Context for global state (e.g., AuthContext)
├── hooks/          # Custom reusable hooks
├── integrations/   # Supabase client and auto-generated database types
├── lib/            # Utility functions
├── pages/          # Route components, organized by public and dashboard views
└── supabase/       # Database migrations and configuration
```

## Getting Started

To run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone https://github.com/joonjoones2-bot/africa-dev-hub.git
cd africa-dev-hub
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**

Create a `.env` file in the root of the project and add your Supabase project credentials. You can get these from your Supabase project's dashboard under `Settings > API`.

```.env
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_ANON_KEY"
```

**4. Set up the database:**

If you don't have the Supabase CLI installed, follow the [official guide](https://supabase.com/docs/guides/cli/getting-started) to install it.

Link your local repository to your Supabase project:
```bash
supabase link --project-ref <your-project-ref>
```

Push the database migrations to set up the schema:
```bash
supabase db push
```

**5. Run the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the source code using ESLint.
*   `npm run preview`: Starts a local server to preview the production build.
*   `npm test`: Runs tests using Vitest.
