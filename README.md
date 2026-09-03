# 🏏 IPL Data Platform (Full-Stack)

A production-grade, containerized full-stack platform for exploring, querying, and analyzing Indian Premier League (IPL 2022) cricket data. Built with a high-performance **Next.js 14 App Router** frontend, an **Express.js + TypeScript** backend, and **PostgreSQL** powered by **Prisma ORM**.

---

## 🌐 Live Deployed Application

| Service | Live URL | Description |
|---|---|---|
| **🎨 Web Application (Frontend)** | [https://ipl-2022-stats-web-sepia.vercel.app](https://ipl-2022-stats-web-sepia.vercel.app) | Next.js 14 responsive UI deployed on Vercel |
| **📚 Interactive Swagger UI** | [https://ipl-2022-stats.onrender.com/api-docs](https://ipl-2022-stats.onrender.com/api-docs) | OpenAPI 3.0 interactive documentation |
| **⚡ REST API Base** | [https://ipl-2022-stats.onrender.com](https://ipl-2022-stats.onrender.com) | Express + TypeScript API on Render |
| **💚 API Healthcheck** | [https://ipl-2022-stats.onrender.com/health](https://ipl-2022-stats.onrender.com/health) | Uptime & service health probe |
| **🗄️ Database** | `Neon Serverless PostgreSQL` | Managed PostgreSQL with 247 player career records |

---

## 📑 Table of Contents
- [Live Deployed Application](#-live-deployed-application)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Database Schema & Data Modeling](#-database-schema--data-modeling)
- [Backend API & OpenAPI / Swagger](#-backend-api--openapi--swagger)
- [Frontend Application & Screens](#-frontend-application--screens)
- [Getting Started (Local Development)](#-getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [Option 1: Using Docker Compose (Recommended)](#option-1-using-docker-compose-recommended)
  - [Option 2: Running Locally without Docker](#option-2-running-locally-without-docker)
- [Data Ingestion / Seeding](#-data-ingestion--seeding)
- [Containerization & Docker](#-containerization--docker)
- [Kubernetes & Cloud Deployment (Stretch Goal)](#-kubernetes--cloud-deployment-stretch-goal)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Project Structure](#-project-structure)

---

## 🏛 Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Next.js 14 Frontend    │
                          │   (React Query + UI)     │
                          │   Port: 3000             │
                          └─────────────┬────────────┘
                                        │ REST API (JSON)
                                        ▼
                          ┌──────────────────────────┐
                          │    Express + TypeScript  │
                          │    Backend (OpenAPI/docs)│
                          │    Port: 3001             │
                          └─────────────┬────────────┘
                                        │ Prisma ORM
                                        ▼
                          ┌──────────────────────────┐
                          │    PostgreSQL Database   │
                          │    Port: 5432            │
                          └──────────────────────────┘
```

The monorepo is managed using **pnpm workspaces** and **Turborepo** for caching, task orchestration, and isolated package builds.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Database** | PostgreSQL 16, Prisma ORM |
| **Backend API** | Node.js 20, Express 4, TypeScript, Zod, Swagger UI / OpenAPI 3.0 |
| **Frontend UI** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Data Visualization** | Recharts (Bar Charts, Pie Charts, Trendlines) |
| **State & Data Fetching** | TanStack React Query v5 |
| **Containerization** | Docker, Docker Compose (Multi-stage alpine builds) |
| **Orchestration** | Kubernetes manifests (`k8s/deployment.yaml`), Ingress, ConfigMaps, Secrets |
| **CI / CD** | GitHub Actions (Lint, Type Check, Build, Docker Image Build & Push to GHCR) |

---

## 🗄 Database Schema & Data Modeling

The relational PostgreSQL schema models the IPL 2022 dataset:

```
┌──────────────┐          ┌────────────────┐          ┌──────────────┐
│    teams     │◄─────────┤    matches     ├─────────►│    venues    │
└──────┬───────┘          └───────┬────────┘          └──────────────┘
       │                          │
       │ 1:N                      │ 1:N
       ▼                          ▼
┌──────────────┐          ┌────────────────┐
│squad_entries │          │ batting_stats  │
└──────┬───────┘          └───────┬────────┘
       │                          │
       ▼                          ▼
┌──────────────┐          ┌────────────────┐
│   players    │◄─────────┤ bowling_stats  │
└──────────────┘          └────────────────┘
```

### Key Models:
- **`Team`**: Franchise metadata (name, abbreviation, logo URLs, country).
- **`Player`**: Player profiles (name, nationality, batting style, bowling style, birth info, role).
- **`Venue`**: Stadium metadata (name, city, country).
- **`Match`**: Match results, scores, overs, toss decision/winner, umpires, winner, DLS indicator.
- **`SquadEntry`**: Relational join between teams and players.
- **`BattingStat`**: Aggregated batting leaderboards (runs, 4s, 6s, 50s, 100s, SR, average, highest).
- **`BowlingStat`**: Aggregated bowling leaderboards (wickets, economy, average, SR, 5-wicket hauls, maidens).
- **`Standing`**: Standings/points table (played, won, lost, points, net run rate).

---

## 📡 Backend API & OpenAPI / Swagger

All API endpoints are documented with OpenAPI 3.0 annotations and accessible via **Swagger UI** at:
👉 `http://localhost:3001/api-docs`

### Core Endpoints:

#### 1. System & Health
- `GET /health`: Healthcheck endpoint with service status and timestamp.

#### 2. Teams (`/api/teams`)
- `GET /api/teams`: List all 10 IPL franchises with win counts and standings.
- `GET /api/teams/:id`: Detailed team profile, roster, and top performers.
- `GET /api/teams/:id/matches`: Paginated match history for a specific team.
- `GET /api/teams/:id/stats`: Team statistics, top 5 run scorers and wicket takers.

#### 3. Matches (`/api/matches`)
- `GET /api/matches`: Paginated match listings with filtering by `teamId` and `venueId`.
- `GET /api/matches/:id`: Detailed match scorecard, venue, toss, and officials.

#### 4. Players (`/api/players`)
- `GET /api/players`: Search and filter players by `search` (name), `role` (bat/bowl/all/wk), and `teamId`.
- `GET /api/players/:id`: Player profile with career and IPL 2022 batting/bowling statistics.

#### 5. Statistics & Analytics (`/api/stats`)
- `GET /api/stats/overview`: Overview metrics (total matches, teams, players, Orange/Purple cap holders).
- `GET /api/stats/batting?type=most_runs&limit=20`: Batting leaderboard (`most_runs`, `most_sixes`, `most_fours`, `most_centuries`, `most_fifties`, `highest_average`, `highest_sr`).
- `GET /api/stats/bowling?type=top_wickets&limit=20`: Bowling leaderboard (`top_wickets`, `best_economy`, `best_average`, `best_sr`, `five_wickets`, `most_maidens`).
- `GET /api/stats/toss`: Toss decision impact and win percentage correlation.

#### 6. Standings (`/api/standings`)
- `GET /api/standings`: Official league points table sorted by points and Net Run Rate (NRR).

---

## 🖥 Frontend Application & Screens

The Next.js 14 App Router application features a dark-themed, responsive dashboard:

1. **Dashboard (`/`)**:
   - KPI metric cards (Total Matches, Teams, Players, Orange Cap leader).
   - Interactive Recharts bar chart showing top run scorers.
   - Live Points Table preview.
   - Recent match results cards.
2. **Matches Browser (`/matches`)**:
   - Server-paginated cards for all 74 IPL matches with score summaries, overs, and match outcomes.
3. **Match Details (`/matches/[id]`)**:
   - In-depth scorecard, toss decision, match officials, venue, and DLS indicators.
4. **Teams Grid (`/teams`)**:
   - Cards displaying all franchises with team logos, win/loss stats, and standings.
5. **Team Profile (`/teams/[id]`)**:
   - Franchise details, complete 2022 squad list, and recent match performance.
6. **Player Directory (`/players`)**:
   - Real-time search by player name and filter by playing role (Batters, Bowlers, All-rounders, Wicket-keepers).
7. **Player Profile (`/players/[id]`)**:
   - Bio, nationality, batting style, bowling style, and complete IPL 2022 statistical breakdown.
8. **Points Table (`/standings`)**:
   - Complete standings table with P, W, L, NR, NRR, and Points highlighting playoff qualification (top 4).
9. **Analytics Dashboard (`/analytics`)**:
   - Interactive dropdown-controlled leaderboards for batting and bowling.
   - Toss win vs match win donut/pie chart.
   - Team Net Run Rate (NRR) horizontal bar comparison.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0 (`npm install -g pnpm`)
- **Docker & Docker Compose** (optional for containerized run)
- **PostgreSQL** 14+ (if running without Docker)

---

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ipl-fullstack-intern
   ```

2. **Start all services (Postgres, API, Frontend)**:
   ```bash
   docker compose up --build
   ```

3. **Seed the database** (in another terminal):
   ```bash
   docker exec -it ipl_api pnpm run db:seed
   ```

4. **Access the application**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3001](http://localhost:3001)
   - **Swagger OpenAPI Docs**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
   - **API Healthcheck**: [http://localhost:3001/health](http://localhost:3001/health)

---

### Option 2: Running Locally without Docker

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Ensure PostgreSQL is running locally on port 5432 with database `ipl_db`.

3. **Run Prisma Migrations & Seed**:
   ```bash
   cd apps/api
   pnpm db:push
   pnpm db:seed
   ```

4. **Start Development Servers (Turborepo)**:
   ```bash
   # From root directory
   pnpm dev
   ```
   - Frontend starts on `http://localhost:3000`
   - Backend API starts on `http://localhost:3001`

---

## 📦 Data Ingestion / Seeding

The dataset ingestion pipeline is powered by `apps/api/prisma/seed.ts`. It parses the JSON dataset located in `Indian_Premier_League_2022-03-26/` and executes idempotent upsert operations:
- 10 Teams
- 6 Match Venues
- 74 IPL Matches
- 247+ Player Profiles
- Batting leaderboard entries (runs, boundaries, averages, strike rates)
- Bowling leaderboard entries (wickets, economy rates, maidens)
- Season Standings & Net Run Rates

Run the seed script anytime:
```bash
pnpm --filter @ipl/api db:seed
```

---

## 🐳 Containerization & Docker

Optimized, multi-stage Alpine Dockerfiles:
- **`docker/api.Dockerfile`**: Node.js 20 Alpine with Prisma client generation and lightweight execution.
- **`docker/web.Dockerfile`**: Next.js standalone output build.
- **`docker-compose.yml`**: Local hot-reloading development environment.
- **`docker-compose.prod.yml`**: Production-ready compose configuration with healthchecks and volume persistence.

---

## ☸️ Kubernetes & Cloud Deployment (Stretch Goal)

Production-ready Kubernetes manifests are provided in `k8s/deployment.yaml`:
- **Namespace**: `ipl-platform`
- **PostgreSQL**: PersistentVolumeClaim (5Gi) + Deployment + ClusterIP Service.
- **API**: 2-replica Deployment with Liveness/Readiness probes (`/health`) + Horizontal Scaling readiness.
- **Web**: 2-replica Next.js standalone Deployment.
- **Ingress**: NGINX Ingress routing `/api`, `/api-docs`, and `/` traffic.

To deploy to any Kubernetes cluster (GKE, AKS, EKS, Minikube):
```bash
kubectl apply -f k8s/deployment.yaml
```

---

## 🔄 CI/CD Pipeline

Configured via **GitHub Actions**:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- Triggers on every pull request and push.
- Steps:
  1. **Linting & Code Quality**: ESLint + Prettier format verification.
  2. **Type Checking**: `tsc --noEmit` across all workspace packages.
  3. **Build**: Turborepo build pipeline (`turbo run build`).
  4. **Docker Build Check**: Builds API and Web container images to prevent build regressions.

### 2. Continuous Deployment (`.github/workflows/deploy.yml`)
- Triggers on merge to `main`.
- Builds and publishes production Docker images to **GitHub Container Registry (GHCR)**:
  - `ghcr.io/<repo>/ipl-api:latest`
  - `ghcr.io/<repo>/ipl-web:latest`

---

## 📂 Project Structure

```
ipl-fullstack-intern/
├── apps/
│   ├── api/                           # Express.js + TypeScript Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # PostgreSQL schema models
│   │   │   └── seed.ts                # Dataset ingestion script
│   │   ├── src/
│   │   │   ├── routes/                # Route handlers (teams, matches, players, stats, standings)
│   │   │   ├── middleware/            # Error handling & validation
│   │   │   ├── utils/                 # Pagination & response helpers
│   │   │   ├── swagger.ts             # OpenAPI 3.0 configuration
│   │   │   ├── app.ts                 # Express application setup
│   │   │   └── index.ts               # Server entry point
│   │   └── package.json
│   └── web/                           # Next.js 14 App Router Frontend
│       ├── src/
│       │   ├── app/                   # Pages: /, /matches, /teams, /players, /standings, /analytics
│       │   ├── components/            # Reusable UI (Navbar, StatsCard, MatchCard, charts)
│       │   └── lib/                   # Axios API client & utils
│       └── package.json
├── packages/
│   └── types/                         # Shared TypeScript interfaces (@ipl/types)
├── docker/
│   ├── api.Dockerfile                 # Multi-stage API Dockerfile
│   └── web.Dockerfile                 # Multi-stage Next.js Dockerfile
├── k8s/
│   └── deployment.yaml                # Kubernetes manifests (Deployments, Services, Ingress)
├── .github/
│   └── workflows/
│       ├── ci.yml                     # CI pipeline
│       └── deploy.yml                 # CD GHCR deployment
├── docker-compose.yml                 # Local dev orchestration
├── docker-compose.prod.yml            # Production compose setup
├── turbo.json                         # Turborepo pipeline configuration
├── pnpm-workspace.yaml                # Workspace definitions
└── README.md                          # Project documentation
```
