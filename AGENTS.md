# Build, Lint, and Test Commands

## Frontend (Angular)
- **Build**: `ng build`
- **Dev Server**: `ng serve`
- **Test**: `ng test --watch=false --browsers=ChromeHeadless`
  - **Single Test**: `ng test --include **/path/to/spec.ts` or use `fdescribe` in the spec file.
- **Lint**: `ng lint`

## Backend (Spring Boot)
- **Directory**: `baskyapp/`
- **Build & Run**: `./mvnw spring-boot:run`
- **Test**: `./mvnw test`
  - **Single Test**: `./mvnw -Dtest=TestClassName test`

# Architecture & Structure

- **Frontend**: `src/` - Angular 18+ Standalone Components.
  - `src/components/`: UI components (PlayerPage, TeamPage, etc.).
  - `src/services/`: Data services (BasketballDataService).
- **Backend**: `baskyapp/` - Spring Boot 3.5.6 (Java 21).
  - `com.nba.baskyapp`: Root package.
  - Sub-packages: `player`, `team`, `game`, `boxscore`.
- **Database**: PostgreSQL 16 (Dockerized).
- **Utilities**: `utilities/` - Python scrapers (`nba_api`).

# Code Style & Conventions

- **General**:
  - Use **absolute paths** for file references in tools.
  - Follow **Angular Standalone Component** patterns (no NgModules).
  - **Java**: standard Spring Boot patterns, constructor injection, REST controllers.
- **Formatting**:
  - TypeScript: strict mode, explicit types.
  - Java: Standard Java conventions.
- **Naming**:
  - Files: `kebab-case` (Angular), `PascalCase` (Java classes).
  - Variables: `camelCase`.
- **Error Handling**:
  - Frontend: Handle RxJS errors gracefully in services.
  - Backend: Use Global Exception Handlers for REST APIs.
