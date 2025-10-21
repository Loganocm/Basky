# Quick Start Guide - Basky Basketball App

## Prerequisites

- PostgreSQL 12+ installed and running
- Java 21+ installed
- Node.js 20+ or 22+ (LTS recommended)
- Maven (included via mvnw wrapper)

## Setup Steps

### 1. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE nba_data;
```

The application will automatically create the necessary tables on first run (configured with `spring.jpa.hibernate.ddl-auto=update`).

### 2. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd baskyapp
```

**On Windows (PowerShell):**

```bash
.\mvnw.cmd spring-boot:run
```

**On Linux/Mac:**

```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

You should see output like:

```
Started Application in X.XXX seconds
```

### 3. Start the Frontend

Open a **new terminal** and navigate to the project root:

```bash
cd c:\Users\Logan\Desktop\Github\Basky
```

Install dependencies (first time only):

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will start on `http://localhost:4200`

### 4. Access the Application

Open your browser and go to:

```
http://localhost:4200
```

The app will automatically fetch data from the backend and display:

- Player statistics
- Team information
- Recent games
- Interactive leaderboards

## Verify Integration

### Check Backend Health

Test if the backend is running:

```bash
curl http://localhost:8080/api/players
```

Or in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/players"
```

### Add Sample Data

You can add sample data through the backend API or let the DataSeeder populate it automatically.

Check if `DataSeeder.java` is configured to run on startup.

## Troubleshooting

### Backend won't start

**Issue:** Port 8080 already in use

```
Solution: Stop any other services using port 8080 or change the port in application.properties:
server.port=8081
```

**Issue:** Database connection failed

```
Solution: Verify PostgreSQL is running and credentials in application.properties are correct:
- spring.datasource.url=jdbc:postgresql://localhost:5432/nba_data
- spring.datasource.username=postgres
- spring.datasource.password=1738
```

### Frontend won't start

**Issue:** Port 4200 already in use

```
Solution: Kill the process using port 4200 or use a different port:
ng serve --port 4201
```

**Issue:** Cannot connect to backend

```
Solution: Verify backend is running on port 8080 and check the baseUrl in basketball-data.service.ts
```

### CORS Errors

The backend should already have CORS enabled via `@CrossOrigin(origins = "*")` on all controllers. If you still see CORS errors:

1. Check that all controllers have the annotation
2. Verify the backend is running
3. Check browser console for specific error messages

## Development Workflow

### Making Changes to Backend

1. Edit Java files in `baskyapp/src/main/java/`
2. The app will auto-reload with Spring Boot DevTools
3. Or restart manually: `Ctrl+C` then `.\mvnw.cmd spring-boot:run`

### Making Changes to Frontend

1. Edit TypeScript files in `src/`
2. The app will auto-reload via Angular Live Development Server
3. Check the terminal for any compilation errors

### Running Tests

**Backend Tests:**

```bash
cd baskyapp
.\mvnw.cmd test
```

**Frontend Tests (when configured):**

```bash
npm test
```

## Production Build

### Build Frontend

```bash
npm run build
```

Output will be in `dist/demo/`

### Build Backend JAR

```bash
cd baskyapp
.\mvnw.cmd clean package
```

JAR will be in `baskyapp/target/baskyapp-0.0.1-SNAPSHOT.jar`

### Run Production Build

```bash
java -jar baskyapp/target/baskyapp-0.0.1-SNAPSHOT.jar
```

## Next Steps

1. **Add more player data**: Use the API endpoints to add players, teams, and games
2. **Customize the UI**: Edit components in `src/components/`
3. **Add authentication**: Secure the API endpoints
4. **Deploy**: Consider Docker containers for easy deployment

## Support

For issues or questions, check:

- `INTEGRATION_FIXES.md` - Detailed integration documentation
- `API_REFERENCE.md` - Complete API endpoint reference
- `BACKGROUND_SETUP.md` - Original setup notes
