# Azure Deployment - Backend Integration Guide

## Overview

Your Spring Boot backend on Azure can now automatically trigger Supabase Edge Functions to sync NBA data when the database is empty or on-demand via REST API.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MS Azure                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Spring Boot Backend                               │    │
│  │  (baskyapp)                                        │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────┐         │    │
│  │  │ DatabaseInitializer                  │         │    │
│  │  │ - Checks DB on startup               │         │    │
│  │  │ - Triggers sync if empty             │         │    │
│  │  └──────────────────────────────────────┘         │    │
│  │                  │                                  │    │
│  │                  ▼                                  │    │
│  │  ┌──────────────────────────────────────┐         │    │
│  │  │ SupabaseFunctionService              │         │    │
│  │  │ - Calls Supabase Edge Functions      │         │    │
│  │  └──────────────────────────────────────┘         │    │
│  │                  │                                  │    │
│  └──────────────────┼──────────────────────────────────┘   │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌────────────────┐          ┌────────────────┐
│   Supabase     │          │   Supabase     │
│ Edge Functions │◄────────►│  PostgreSQL    │
├────────────────┤          │   Database     │
│ nba-data-sync  │          │                │
│ nba-boxscores- │          │ - teams        │
│     batch      │          │ - players      │
└────────────────┘          │ - games        │
                            │ - box_scores   │
                            └────────────────┘
```

---

## 🚀 Quick Setup

### 1. Add Configuration to application.properties

Copy the template and add your Supabase credentials:

```properties
# Supabase Configuration
supabase.url=https://YOUR_PROJECT_REF.supabase.co
supabase.service-role-key=${SUPABASE_SERVICE_ROLE_KEY}
supabase.anon-key=${SUPABASE_ANON_KEY}
supabase.auto-sync-when-empty=true
supabase.auto-sync-on-startup=false

# Database Connection (Supabase PostgreSQL)
spring.datasource.url=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
```

### 2. Set Environment Variables in Azure

In Azure Portal:

1. Go to your App Service
2. Configuration → Application settings
3. Add these variables:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your service role key)
SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-database-password
```

### 3. Deploy Your Backend

```bash
# Build the application
cd baskyapp
mvn clean package

# Deploy to Azure (using Azure CLI)
az webapp deploy --resource-group YOUR_RESOURCE_GROUP \
  --name YOUR_APP_NAME \
  --src-path target/baskyapp-0.0.1-SNAPSHOT.jar \
  --type jar
```

---

## 🎯 How It Works

### Automatic Sync on Startup

When your backend starts up:

1. **DatabaseInitializer** checks if the database is empty
2. If empty AND `supabase.auto-sync-when-empty=true`:
   - Calls **nba-data-sync** function (teams, players, games)
   - Calls **nba-boxscores-batch** once (initial 20 games)
3. Logs the results

**First deployment with empty DB:**

```
2025-11-02 10:00:00 INFO  Application ready - checking database status...
2025-11-02 10:00:00 INFO  Current team count: 0
2025-11-02 10:00:00 INFO  Database is empty, triggering initial data sync...
2025-11-02 10:00:00 INFO  Triggering NBA data sync via Supabase function
2025-11-02 10:00:45 INFO  Initial data sync completed successfully
2025-11-02 10:00:45 INFO  Triggering initial box score batch...
2025-11-02 10:02:30 INFO  Initial box score batch completed
2025-11-02 10:02:30 INFO  ✅ Initial database sync completed
```

**Subsequent startups:**

```
2025-11-02 11:00:00 INFO  Application ready - checking database status...
2025-11-02 11:00:00 INFO  Current team count: 30
2025-11-02 11:00:00 INFO  Database is not empty, skipping auto-sync
```

### Manual Sync via REST API

You can also trigger syncs manually or from external services:

```bash
# Trigger main data sync (teams, players, games)
curl -X POST https://your-app.azurewebsites.net/api/admin/sync/data

# Trigger box score batch (20 games)
curl -X POST https://your-app.azurewebsites.net/api/admin/sync/boxscores

# Trigger multiple batches (max 10)
curl -X POST "https://your-app.azurewebsites.net/api/admin/sync/boxscores/full?maxBatches=10"
```

---

## 📊 Configuration Options

### supabase.auto-sync-when-empty

**Default:** `true`  
**When to use:**

- ✅ First deployment to Azure (empty database)
- ✅ Development/staging environments
- ❌ Production after initial load (use scheduled jobs instead)

### supabase.auto-sync-on-startup

**Default:** `false`  
**When to use:**

- ✅ Development (always get fresh data)
- ⚠️ Production with caution (adds 45s to startup time)
- ❌ High-traffic production (use scheduled jobs)

### Recommended Production Settings

```properties
# Production: Don't sync on every startup
supabase.auto-sync-on-startup=false

# Production: Only sync if truly empty (safety net)
supabase.auto-sync-when-empty=true

# Production: Use Azure scheduled jobs instead
# See "Scheduling" section below
```

---

## ⏰ Scheduling (Recommended for Production)

Instead of syncing on startup, use Azure scheduled jobs:

### Option 1: Azure Logic Apps

Create a Logic App to call your backend API daily:

1. **Trigger:** Recurrence (Daily at 6 AM UTC)
2. **Action:** HTTP POST to `https://your-app.azurewebsites.net/api/admin/sync/data`
3. **Headers:** `Content-Type: application/json`

### Option 2: Azure Functions Timer Trigger

```csharp
// Azure Function (C#)
[FunctionName("NBADataSync")]
public static async Task Run(
    [TimerTrigger("0 0 6 * * *")] TimerInfo timer, // Daily at 6 AM
    ILogger log)
{
    using var client = new HttpClient();
    var response = await client.PostAsync(
        "https://your-app.azurewebsites.net/api/admin/sync/data",
        null
    );
    log.LogInformation($"Sync triggered: {response.StatusCode}");
}
```

### Option 3: Keep Using Supabase Cron

You can bypass your backend and call Supabase functions directly via cron (see DEPLOYMENT_GUIDE.md).

---

## 🔒 Security Considerations

### Environment Variables (Required)

**NEVER commit these to Git:**

- `SUPABASE_SERVICE_ROLE_KEY` - Full admin access
- `SUPABASE_DB_PASSWORD` - Database credentials

**Always use Azure App Settings** for these values.

### API Endpoint Security

The `/api/admin/sync/*` endpoints are currently unprotected. Add security:

```java
// Add Spring Security dependency to pom.xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

// Protect admin endpoints
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .build();
    }
}
```

---

## 🧪 Testing

### Test Locally Before Deploying

1. **Update application.properties** with your Supabase credentials
2. **Run the backend:**
   ```bash
   cd baskyapp
   mvn spring-boot:run
   ```
3. **Check logs** for initialization:
   ```
   INFO  Application ready - checking database status...
   ```
4. **Test sync endpoint:**
   ```bash
   curl -X POST http://localhost:8080/api/admin/sync/data
   ```

### Test on Azure After Deployment

1. **Check application logs:**
   ```bash
   az webapp log tail --name YOUR_APP_NAME --resource-group YOUR_RESOURCE_GROUP
   ```
2. **Test health endpoint:**
   ```bash
   curl https://your-app.azurewebsites.net/actuator/health
   ```
3. **Test sync endpoint:**
   ```bash
   curl -X POST https://your-app.azurewebsites.net/api/admin/sync/data
   ```

---

## 🐛 Troubleshooting

### Backend doesn't trigger sync on startup

**Check:**

1. Is `supabase.auto-sync-when-empty=true`?
2. Is the database truly empty? Check logs for team count
3. Are environment variables set in Azure?
4. Check Azure application logs for errors

### "Connection refused" or timeout errors

**Causes:**

1. Wrong Supabase URL in configuration
2. Firewall blocking outbound HTTPS from Azure
3. Invalid service role key

**Fix:**

- Verify `supabase.url` is correct
- Check Azure allows outbound HTTPS (port 443)
- Regenerate service role key in Supabase dashboard

### Sync works locally but not on Azure

**Check:**

1. Environment variables are set in Azure App Settings
2. Azure App Service has outbound internet access
3. Connection strings use `${VAR}` syntax for env variables

---

## 📈 Monitoring

### View Backend Logs in Azure

```bash
# Stream logs in real-time
az webapp log tail --name YOUR_APP_NAME --resource-group YOUR_RESOURCE_GROUP

# Download logs
az webapp log download --name YOUR_APP_NAME --resource-group YOUR_RESOURCE_GROUP
```

### View Supabase Function Logs

In Supabase Dashboard:

- Edge Functions → nba-data-sync → Logs
- Edge Functions → nba-boxscores-batch → Logs

### Health Check Endpoint

```bash
curl https://your-app.azurewebsites.net/actuator/health
```

Returns:

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

---

## 🎯 Deployment Checklist

- [ ] Supabase Edge Functions deployed
- [ ] Database migration applied (box_score_synced column)
- [ ] Backend code updated with integration classes
- [ ] application.properties configured
- [ ] Environment variables set in Azure
- [ ] Backend deployed to Azure
- [ ] Tested sync endpoint
- [ ] Checked logs for successful sync
- [ ] (Optional) Set up scheduled jobs
- [ ] (Optional) Add security to admin endpoints

---

## 📚 Related Documentation

- [Supabase DEPLOYMENT_GUIDE.md](../../supabase/DEPLOYMENT_GUIDE.md) - Deploy Edge Functions
- [Supabase QUICK_REFERENCE.md](../../supabase/QUICK_REFERENCE.md) - Common operations
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)

---

## 🎉 You're All Set!

Your Azure backend will now:
✅ Automatically sync data when database is empty  
✅ Provide REST API for manual syncs  
✅ Connect seamlessly to Supabase functions  
✅ Log all operations for monitoring

**Next:** Deploy to Azure and watch it work! 🚀
