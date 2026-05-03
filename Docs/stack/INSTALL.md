# Install Commands — Proyecto de Cargas Administrativas

Copy-paste reference for setting up the project from scratch.
Statuses mark what is already done in this repo vs what each developer must do locally.

Status key:

- [DONE] Already done in this repo.
- [TODO] Not done in this repo yet.
- [LOCAL] Must be installed on each developer machine.

---

## Prerequisites (local machine)

### 1. Node.js 24 LTS

Status: [LOCAL] Required on each developer machine; not tracked in repo.

Download from: <https://nodejs.org/en/download> (select "LTS")

Verify:

```bash
node --version   # should print v24.x.x
npm --version
```

### 2. .NET 10 SDK

Status: [LOCAL] Required on each developer machine; not tracked in repo.

Download from: <https://dotnet.microsoft.com/en-us/download/dotnet/10.0>

Verify:

```bash
dotnet --version   # should print 10.x.x
```

---

## Frontend Setup (repo)

### Scaffold the React + TypeScript project

Status: [DONE] Frontend already exists in the repo (Vite + React + TS).

```bash
npm create vite@latest Frontend -- --template react-ts
cd Frontend
```

This creates a Vite project with React 19 and TypeScript 6 pre-configured.

### Install all frontend dependencies

Status: [DONE] Dependencies are already listed and locked in the repo.

Local setup: run `npm install` in Frontend to restore node_modules.
The individual install commands below are only needed if re-creating the lockfile.

```bash
npm install react-router-dom
npm install react-hook-form
npm install recharts
npm install tailwindcss @tailwindcss/vite
npm install -D @types/react @types/react-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Initialize Tailwind

Status: [DONE] Tailwind is already configured in Vite and the main CSS.

```bash
# In vite.config.ts, add the Tailwind plugin (see Tailwind v4 docs)
# Then add @import "tailwindcss"; to your main CSS file
```

---

## Backend Setup (repo)

### Create the ASP.NET Core Web API project

Status: [DONE] Backend project already exists in the repo.

```bash
dotnet new webapi -n Backend --framework net10.0
cd Backend
```

### Install NuGet packages

Status: [DONE] Required packages are already referenced in the repo.

```bash
# Oracle database driver
dotnet add package Oracle.ManagedDataAccess.Core

# ASP.NET Identity (already included in most webapi templates, but if needed)
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore

# Excel report generation
dotnet add package ClosedXML

# PDF report generation
dotnet add package QuestPDF
```

### Roslyn Analyzers (no install needed)

Status: [DONE] Analyzer settings are already present in the repo.

Roslyn Analyzers are bundled with the .NET 10 SDK. To enable the full recommended ruleset, add this to your `.csproj`:

```xml
<PropertyGroup>
  <EnableNETAnalyzers>true</EnableNETAnalyzers>
  <AnalysisLevel>latest</AnalysisLevel>
  <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
</PropertyGroup>
```

---

## SonarQube Cloud Setup

Status: [TODO] No SonarQube Cloud config file is present in the repo yet.

1. Go to <https://sonarcloud.io> and sign in with GitHub/GitLab
2. Create a new project linked to your repository
3. Follow the setup wizard — it's free for public/student repos
4. Add the generated `sonar-project.properties` file to your repo root

---

## Version lock reminder

Status: [DONE] Version lock files are already present in the repo.

After setup, always commit these files to the repo:

- `Frontend/package-lock.json` — locks exact frontend dependency versions
- `Backend/Backend.csproj` — locks NuGet package versions

This ensures every teammate gets the exact same versions when they clone and install.

---

## Pinned versions reference

| Tool | Pinned version |
| --- | --- |
| Node.js | 24 LTS |
| .NET SDK | 10.0 LTS |
| React | 19.2.5 (set by Vite template or `npm install react@19.2.5`) |
| TypeScript | 6.0 (set by Vite template or `npm install typescript@6`) |
| C# | 14 (bundled with .NET 10) |
| ASP.NET Core | 10.0 (bundled with .NET 10) |
