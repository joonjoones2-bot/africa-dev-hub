

# LinkDevsOrg — Full MVP Plan

## Overview
A platform connecting African university graduates with mentors and employers through real-world software projects, mentorship, and portfolio building.

## Design System
- **Primary**: Deep Blue (#1e3a5f)
- **Secondary**: Purple (#7c3aed)  
- **Accent**: Green (#10b981)
- **Style**: Clean, professional, youth-friendly — inspired by LinkedIn/GitHub

---

## Phase 1: Landing Page & Auth

### Public Landing Page
- Hero section: tagline, CTA buttons (Join as Graduate / Mentor / Employer)
- How It Works section (3-step visual)
- Stats/impact section
- Testimonials placeholder
- Footer with links

### Authentication (Supabase Auth)
- Sign up with role selection (Graduate / Mentor / Employer)
- Login page
- Role-specific onboarding fields:
  - **Graduates**: area of interest, languages, skill level
  - **Mentors**: years of experience, tech specializations
  - **Employers**: company name, industry, website
- Common fields: name, email, password, country, LinkedIn, GitHub

### Database Tables
- `profiles` (linked to auth.users)
- `user_roles` (separate table for security)
- `mentor_profiles`, `employer_profiles`, `graduate_profiles` (role-specific data)

---

## Phase 2: Graduate Dashboard

- **My Profile**: skills, education, GitHub, portfolio display
- **Available Mentors**: browse mentors with filters, request mentorship
- **Projects Marketplace**: browse and apply to real-world projects
- **My Projects**: track assigned projects, deadlines, submit work (GitHub links, file uploads)
- **Feedback & Reviews**: view mentor evaluations and ratings
- **Portfolio**: auto-generated page from completed projects (public-facing)

---

## Phase 3: Mentor Dashboard

- **Mentor Profile**: skills, experience, tech stack
- **Mentor Requests**: accept/reject graduate requests
- **Create Projects**: post coding projects with description, skills needed, difficulty, timeline
- **Manage Students**: track mentee progress, leave feedback, rate work

---

## Phase 4: Employer Dashboard

- **Talent Discovery**: browse graduates with filters (skills, projects, ratings)
- **Portfolio Viewing**: view graduate profiles, projects, GitHub repos, mentor feedback
- **Post Opportunities**: create internships, junior dev jobs, contract projects
- **Bookmarked Graduates**: save and follow promising candidates

---

## Phase 5: Platform Features

- **Messaging**: simple chat between Graduate↔Mentor and Employer↔Graduate
- **Notifications**: in-app notifications for key events (request accepted, feedback given, new job posted)
- **Progress Tracking**: visual indicators — projects completed, skills learned, ratings

---

## Navigation
- Sidebar-based dashboard layout (role-specific menu items)
- Responsive design for mobile and desktop
- Role-based routing (graduates, mentors, employers see different dashboards)

## Database Schema (Supabase)
- Projects, mentorship_requests, project_applications, messages, notifications, feedback, bookmarks tables
- Row-Level Security policies per role
- Storage bucket for project file uploads

