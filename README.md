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

## Language Note

The official course specification is in Spanish, but this repository and technical documentation are maintained in English.
