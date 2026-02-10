# Ancile - Recruitment Qualification API

A recruitment API built with **Express**, **Prisma**, **PostgreSQL**, and **Zod** for managing delivery driver candidates. Designed to expose candidate data for **LLM-based evaluation**.

## Features

- 📝 CRUD operations for candidates
- 🤖 LLM-ready evaluation endpoints
- 📊 Structured data format for LLM consumption
- 🔍 Filtering by evaluation status
- 🛡️ Zod validation for LLM responses
- 📋 Tracks evaluation metadata (model, timestamp)

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Validation**: Zod 4

## Quick Start (Docker)

To spin up the entire stack (Frontend, Backend, Database) with a single command for a quick view:

1.  Make sure you have [Docker](https://www.docker.com/) installed.
2.  Run the following command in the root directory:

    ```bash
    docker-compose up --build
    ```

3.  Access the application:
    - **Frontend**: [http://localhost:3001](http://localhost:3001)
    - **Backend API**: [http://localhost:3000](http://localhost:3000)

## Getting Started (Manual Setup)

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (or Docker)

### Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Start PostgreSQL** (using Docker):

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Configure environment:**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database connection string
   DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment?schema=public"

   # OpenAI API Key for LLM features
   OPENAI_API_KEY="your_openai_api_key_here"

   # Server port
   PORT=3000

   # Environment
   NODE_ENV="development"
   ```

4. **Push database schema:**

   ```bash
   bun run db:push
   ```

5. **Generate Prisma client:**

   ```bash
   bun run db:generate
   ```

6. **Seed sample data (optional):**

   ```bash
   bun run db:seed
   ```

7. **Start development server:**
   ```bash
   bun run dev
   ```

## API Endpoints

### Chat (Screening Agent)

| Method | Endpoint    | Description                                      |
| :----- | :---------- | :----------------------------------------------- |
| `POST` | `/api/chat` | streaming chat endpoint for the screening agent. |

### Candidates

| Method | Endpoint          | Description                  |
| :----- | :---------------- | :--------------------------- |
| `GET`  | `/api/candidates` | List candidates with filters |

## Query Parameters

### GET /api/candidates

| Parameter     | Type    | Default   | Description                                          |
| ------------- | ------- | --------- | ---------------------------------------------------- |
| `page`        | number  | 1         | Page number                                          |
| `limit`       | number  | 10        | Items per page (max 100)                             |
| `isQualified` | boolean | -         | Filter by qualification status                       |
| `evaluated`   | boolean | -         | Filter by evaluation status                          |
| `minScore`    | number  | -         | Minimum match score                                  |
| `sortBy`      | string  | createdAt | Sort field (createdAt, matchScore, age, evaluatedAt) |
| `sortOrder`   | string  | desc      | Sort order (asc, desc)                               |

## Qualification Criteria

### Mandatory Requirements (All Required)

| Requirement                       | Field                                                |
| --------------------------------- | ---------------------------------------------------- |
| Age 21+                           | `age >= 21`                                          |
| Valid Driver's License            | `hasValidDriversLicense`                             |
| Clean Driving Record              | `hasCleanDrivingRecord`                              |
| Background Screening              | `passesBackgroundScreening`                          |
| Drug Screening                    | `passesDrugScreening`                                |
| Lift 150 lbs                      | `canLiftUpTo150Lbs`                                  |
| Weekend & Long-Shift Availability | `hasWeekendAvailability && hasLongShiftAvailability` |

### Preferred Qualifications (Bonus Points)

| Qualification         | Field                     | Points |
| --------------------- | ------------------------- | ------ |
| Delivery Experience   | `hasDeliveryExperience`   | +4%    |
| Courier Experience    | `hasCourierExperience`    | +4%    |
| Time Management       | `hasTimeManagementSkills` | +4%    |
| Organizational Skills | `hasOrganizationalSkills` | +4%    |
| Work Independently    | `canWorkIndependently`    | +4%    |

### Scoring Guidelines

- **Base Score**: 80% if all mandatory requirements are met
- **Bonus Points**: Up to 20% from preferred qualifications (4% each)
- **If mandatory fails**: Score = (mandatory passed / total mandatory) × 80%

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Start development server with hot reload |
| `bun run start`       | Start production server                  |
| `bun run db:generate` | Generate Prisma client                   |
| `bun run db:push`     | Push schema to database                  |
| `bun run db:migrate`  | Run database migrations                  |
| `bun run db:studio`   | Open Prisma Studio                       |
| `bun run db:seed`     | Seed sample data                         |

## License

MIT
