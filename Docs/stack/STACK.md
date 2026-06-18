# Proyecto de Cargas Administrativas — Tech Stack

**Course:** CI-0128 Proyecto Integrador de Ingeniería de Software y Bases de Datos
**Group:** 3 | **Universidad de Costa Rica**

---

## Overview

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + JavaScript (.jsx) |
| Backend | ASP.NET Core 10 (.NET 10 LTS) + C# 14 |
| Database | Oracle Database (via ODP.NET) |
| Static Analysis | ESLint/Prettier + Roslyn Analyzers + SonarCloud |

---

## Frontend

| Tool | Version | Purpose |
| --- | --- | --- |
| React | **19.2.5** | Core UI library |
| JavaScript (.jsx) | latest | React component files — no TypeScript compilation step |
| Tailwind CSS | latest | Responsive design and styling system |
| React Router | latest | Client-side navigation and protected routes |
| React Hook Form | latest | Form handling + real-time validation |
| Recharts | latest | Dashboards and workload visualizations |
| Vite | latest | Dev server and build bundler |
| Node.js | **24 LTS** | Required runtime for frontend toolchain |

### Notes

- React 19 is stable and fully ecosystem-supported.
- Using `.jsx` files with plain JavaScript instead of TypeScript — simpler setup, no compile-time type checking but still gets full React IDE support and autocomplete.
- Vite is the recommended way to scaffold a React project (`npm create vite@latest`).

---

## Backend

| Tool | Version | Purpose |
| --- | --- | --- |
| .NET SDK | **10.0 LTS** | Runtime + build toolchain (includes ASP.NET Core 10 and C# 14) |
| ASP.NET Core | **10.0** | REST API framework — bundled with .NET 10 SDK |
| C# | **14** | Backend language — bundled with .NET 10 SDK |
| ODP.NET | latest | Official Oracle Data Provider for .NET |
| ASP.NET Identity | **10.0** | Auth, role-based access, password hashing, session management |
| ClosedXML | latest | Excel (.xlsx) report generation |
| QuestPDF | latest | PDF report generation |

### Notes (backend)

- .NET 10 is LTS, supported until **November 2028** — safe for a project with a July deadline.
- ASP.NET Core, C# 14, and Roslyn Analyzers all come bundled with the .NET 10 SDK — no separate install needed.
- Architecture follows MVC: **Controllers → Services → Repositories** to satisfy the spec's separation of concerns requirement.

---

## Database

| Tool | Version | Purpose |
| --- | --- | --- |
| Oracle Database | as provided by UCR | Primary data store |
| ODP.NET | latest | .NET driver for Oracle connectivity |

### Notes (database)

- Design schema to at least 3NF as required by spec.
- Add indexes on frequently queried columns (user ID, unit ID, function ID).
- Implement server-side pagination on all large listings to meet the performance requirement of 100+ concurrent users.

---

## Static Analysis

| Tool | Version | Scope | Purpose |
| --- | --- | --- | --- |
| ESLint + Prettier | latest | Frontend (JavaScript/React) | Linting and consistent formatting |
| Roslyn Analyzers | bundled with .NET 10 | Backend (C#) | Security and code quality at compile time |
| SonarCloud | hosted / free | Both | Unified quality dashboard, detects code smells, duplication, vulnerabilities |

### Justification (for deliverable)

- **ESLint + Prettier** — industry standard for JavaScript/React projects; enforces consistent code style across the team, catches common React bugs (e.g. missing `useEffect` dependencies via `eslint-plugin-react-hooks`).
- **Roslyn Analyzers** — built directly into the .NET 10 SDK, zero setup cost; flags C# security anti-patterns and bad practices at compile time before code ever runs.
- **SonarCloud** — free for student/open-source projects; covers both C# and JavaScript in one dashboard, producing the kind of quality report that demonstrates good practices in a final presentation.

---

## Architecture

```text
┌────────────────────────────────────────┐
│           React Frontend               │
│  (Vite + JavaScript/JSX + Tailwind CSS)│
└──────────────┬─────────────────────────┘
               │ HTTP / REST (JSON)
┌──────────────▼─────────────────────────┐
│         ASP.NET Core Backend           │
│  Controllers → Services → Repositories │
│  ASP.NET Identity (auth + roles)       │
└──────────────┬─────────────────────────┘
               │ ODP.NET
┌──────────────▼─────────────────────────┐
│          Oracle Database               │
│  Normalized schema (3NF)               │
│  Indexes + server-side pagination      │
└────────────────────────────────────────┘
```

### Non-functional requirements coverage

| Spec requirement | Covered by |
| --- | --- |
| Responsive design | Tailwind CSS |
| High-fidelity prototypes | Figma (before any screen is built) |
| Real-time form validation | React Hook Form (client) + ASP.NET model validation (server) |
| Password hashing + secure auth | ASP.NET Identity |
| Role-based access control | ASP.NET Identity roles |
| Session expiry | ASP.NET Identity + JWT expiration |
| SQL injection / XSS prevention | ODP.NET parameterized queries + React's default XSS escaping |
| 100+ concurrent users | Stateless REST API + connection pooling |
| DB performance (indexes) | Oracle indexes on key columns |
| Pagination | Server-side via ASP.NET Core endpoints |
| Modular architecture | MVC pattern + separation of concerns |
| Version control with access control | Git (GitHub/GitLab with restricted access) |
| Excel + PDF reports | ClosedXML + QuestPDF |

---

## Tooling summary

- **IDE:** Visual Studio 2022 (backend) + VS Code (frontend) — or Rider if preferred
- **Design:** Figma
- **Version control:** Git (GitHub or GitLab)
- **CI/code quality:** SonarCloud
