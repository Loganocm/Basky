# Complete Setup Script
# This script will help you reset and setup your database with the new schema

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🏀 Basky Database Setup - 3 Table Schema" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "1. Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($pgTest.TcpTestSucceeded) {
        Write-Host "   ✅ PostgreSQL is running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL is not running!" -ForegroundColor Red
        Write-Host "   Please start PostgreSQL and run this script again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ⚠️  Could not verify PostgreSQL status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. What would you like to do?" -ForegroundColor Yellow
Write-Host ""
Write-Host "   [1] Let Spring Boot auto-create database (Recommended)" -ForegroundColor Cyan
Write-Host "   [2] Manually recreate database with Python script" -ForegroundColor Cyan
Write-Host "   [3] Just start the backend (database already setup)" -ForegroundColor Cyan
Write-Host "   [4] Cancel" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📋 Option 1: Auto-create with Spring Boot" -ForegroundColor Green
        Write-Host ""
        Write-Host "This will:" -ForegroundColor Yellow
        Write-Host "  • Drop all existing tables" -ForegroundColor Yellow
        Write-Host "  • Create 3 new tables (teams, players, games)" -ForegroundColor Yellow
        Write-Host "  • Seed sample data (8 teams, 7 players, 5 games)" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "Continue? (yes/no)"
        if ($confirm -eq "yes" -or $confirm -eq "y") {
            Write-Host ""
            Write-Host "Starting Spring Boot application..." -ForegroundColor Green
            Write-Host ""
            Set-Location baskyapp
            .\mvnw.cmd clean spring-boot:run
        } else {
            Write-Host "Cancelled." -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "📋 Option 2: Manual Recreation" -ForegroundColor Green
        Write-Host ""
        Write-Host "This will:" -ForegroundColor Yellow
        Write-Host "  • Drop all existing tables using Python" -ForegroundColor Yellow
        Write-Host "  • Create 3 new empty tables" -ForegroundColor Yellow
        Write-Host "  • Then start Spring Boot to seed data" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "Continue? (yes/no)"
        if ($confirm -eq "yes" -or $confirm -eq "y") {
            Write-Host ""
            Write-Host "Running Python recreation script..." -ForegroundColor Green
            Set-Location utilities
            python recreate_database.py
            
            Write-Host ""
            $startBackend = Read-Host "Start Spring Boot now? (yes/no)"
            if ($startBackend -eq "yes" -or $startBackend -eq "y") {
                Set-Location ..\baskyapp
                .\mvnw.cmd spring-boot:run
            }
        } else {
            Write-Host "Cancelled." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 Option 3: Starting Backend" -ForegroundColor Green
        Write-Host ""
        Write-Host "Starting Spring Boot application..." -ForegroundColor Green
        Set-Location baskyapp
        .\mvnw.cmd spring-boot:run
    }
    
    "4" {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Red
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test API: curl http://localhost:8080/api/players" -ForegroundColor White
Write-Host "   2. Start frontend: npm start" -ForegroundColor White
Write-Host "   3. Open http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   • DATABASE_QUICK_START.md" -ForegroundColor White
Write-Host "   • DATABASE_RESTRUCTURING_SUMMARY.md" -ForegroundColor White
Write-Host "   • API_REFERENCE.md" -ForegroundColor White
