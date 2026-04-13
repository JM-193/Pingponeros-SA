# Pingponeros-SA

Repository for the "integrated Software Engineering and Databases project" course at the School of Computer Science and Informatics ([ECCI](https://www.ecci.ucr.ac.cr/)) of the University of Costa Rica.

## Team Members

- José Manuel Mora Zúñiga - C35280
- Carlos Alberto Obando López - C35655
- Sebastián Gómez Castro - C39031

## Project Overview

Administrative Workloads Project (UCR).

The system is designed as a full-stack web platform with:

- Frontend: React + TypeScript
- Backend: ASP.NET Core + C#
- Database: Oracle Database

The architecture follows MVC + REST practices, with role-based access control and an emphasis on code quality, static analysis, and team-level version control.

## Problem Statement

The current workload management process in the UCR Administration Vice-Rectorate is mostly manual (paper-based, then transcribed to spreadsheets), causing disorganized records and inefficient management of:

- Administrative documents
- Worked hours
- Assigned job functions

This project provides a reliable digital system to centralize and automate those processes.

## Stakeholders

- Administration Vice-Rectorate: Product Owner.
- University staff members (end users): Primary users of the platform.
- Course intermediaries (Course professors): Representatives between the Vice-Rectorate and the development team.

## Requirement Terms

- Administrator: System administrator role.
- Staff Member: End-user role.
- Users: Both roles combined.

## Technology Stack

### Frontend

- React 18: Component-based UI library with role-oriented rendering.
- TypeScript: Static typing across the frontend codebase.
- Tailwind CSS: Responsive, consistent styling system.
- React Router: Client-side navigation and protected routes.
- React Hook Form: Form handling with real-time validation.
- Recharts: Dashboard and workload visualizations.

### Backend

- ASP.NET Core: REST API, MVC architecture, and dependency injection.
- C#: Strongly typed backend language.
- ODP.NET: Oracle data provider for .NET.
- ASP.NET Identity: Authentication, roles, password hashing, and session expiration.
- ClosedXML: Excel (.xlsx) report generation.
- QuestPDF: PDF report generation.

### Database

- Oracle DB as the primary data store (users, functions, workloads, units).
- Normalized schema (3NF) for areas, departments, sections, and roles.
- Indexing strategy for frequent and performance-sensitive queries.
- Server-side pagination for large user/function listings.

## Static Analysis and Quality

- ESLint + Prettier (frontend): Catch common React/TypeScript issues and enforce consistent style.
- Roslyn Analyzers (backend): Detect C# code smells, bad practices, and security-relevant issues at compile time.
- SonarCloud (cross-stack): Unified quality dashboard for C# and TypeScript.

## Architecture and Practices

- MVC (backend): Controllers, services, and repositories.
- REST API: JSON communication between React frontend and ASP.NET backend.
- Role-based authorization: Admin vs. regular user access control.
- Git version control: Team history and controlled collaboration.
- Figma-first workflow: High-fidelity prototypes are prepared before implementation.

## Functional Requirements Summary

- User management:
  - Admins can register users with institutional profile data and assigned roles.
  - Temporary credentials are issued and must be changed within 48 hours.
  - Login, password recovery, profile access, and non-sensitive user lookup are required.
  - Session duration is 1 hour of inactivity.
- Workload management:
  - Users assign weekly time (in minutes) to job functions and breaks.
  - Extra time reporting is allowed up to 1.5x the official workday, with mandatory justification.
  - Function catalogs include predefined HR functions plus custom user-added functions.
- Organizational structure management (admin):
  - Full CRUD for areas, departments, sections, and units.
- Position and function management (admin):
  - Full CRUD for positions, position types, and functions.
  - Function metadata includes periodicity (daily to yearly).
- Reports:
  - Admin reports in Excel and PDF (staff profile, schedules by org unit, out-of-schedule workload).
  - User PDF report for recently submitted workload entries.

## Non-Functional Requirements Summary

- Usability:
  - Responsive UI for desktop and mobile.
  - High-fidelity Figma prototyping before implementation.
  - Real-time form validation, clear error messages, visual consistency, and accessibility basics.
  - Core tasks should be reachable in up to three clicks from the main screen.
- Security:
  - Protection against SQL injection, code injection, and XSS.
  - Hashed password storage, role-based authorization, and validated client/server inputs.
  - Session expiration after 1 hour of inactivity.
  - Repository access control with versioned history.
- Performance:
  - Target support for at least 100 concurrent users.
  - Indexed queries, pagination for large lists, and optimized static assets.
  - Performance testing before final delivery.
- Scalability:
  - Modular architecture and separation of concerns.
  - Normalized database design and growth-ready deployment strategy.
  - Architecture documentation for future maintenance and expansion.

## Scope and Constraints

Included:

- User registration and management.
- Administrative workload management.
- Reports based on registered workload and staff information.

Excluded:

- Digital signature support.
- Native mobile application.

## Initial Project Risks

- Incomplete requirement information can block scope definition.
- Time constraints can impact architecture and design depth.
- Small team size (3 members) can limit delivery capacity.

## Quality Plan Summary

- Code standards: descriptive names, meaningful documentation, and linter compliance.
- Testing strategy: unit and integration tests.
- Peer review gate: changes must pass tests, linters, and required quality checks.
- Branching model:
  - main for stable, functional releases.
  - dev for sprint development.
  - feature branches for isolated work.
- Static analysis stack:
  - ESLint + Prettier (frontend)
  - Roslyn Analyzers (backend)
  - SonarQube or SonarCloud (cross-stack)

## Language Note

The official course specification is in Spanish. This repository and its technical documentation are maintained in English.
