# Install Commands — Proyecto de Cargas Administrativas

Copy-paste reference for setting up the project from scratch.

---

## Prerequisites

### 1. Node.js 24 LTS

Download from: <https://nodejs.org/en/download> (select "LTS")

Verify:

```bash
node --version   # should print v24.x.x
npm --version
```

### 2. .NET 10 SDK

Download from: <https://dotnet.microsoft.com/en-us/download/dotnet/10.0>

Verify:

```bash
dotnet --version   # should print 10.x.x
```

---

## Frontend Setup

### Scaffold the React + JavaScript project

```bash
npm create vite@latest Frontend -- --template react
cd Frontend
```

This creates a Vite project with React 19 and JavaScript (.jsx) pre-configured.

### Install all frontend dependencies

```bash
npm install react-router-dom
npm install react-hook-form
npm install recharts
npm install tailwindcss @tailwindcss/vite
npm install -D eslint prettier eslint-config-prettier
npm install -D eslint-plugin-react eslint-plugin-react-hooks
```

### Initialize Tailwind

```bash
# In vite.config.ts, add the Tailwind plugin (see Tailwind v4 docs)
# Then add @import "tailwindcss"; to your main CSS file
```

---

## Backend Setup

### Create the ASP.NET Core Web API project

```bash
dotnet new webapi -n Backend --framework net10.0
cd Backend
```

### Install NuGet packages

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

Roslyn Analyzers are bundled with the .NET 10 SDK. To enable the full recommended ruleset, add this to your `.csproj`:

```xml
<PropertyGroup>
  <EnableNETAnalyzers>true</EnableNETAnalyzers>
  <AnalysisLevel>latest</AnalysisLevel>
  <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
</PropertyGroup>
```

---

## SonarCloud Setup

1. Go to <https://sonarcloud.io> and sign in with GitHub/GitLab
2. Create a new project linked to your repository
3. Follow the setup wizard — it's free for public/student repos
4. Add the generated `sonar-project.properties` file to your repo root

---

## Version lock reminder

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
| C# | 14 (bundled with .NET 10) |
| ASP.NET Core | 10.0 (bundled with .NET 10) |
