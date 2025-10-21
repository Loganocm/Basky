# Test Backend API Endpoints

Write-Host "=== Testing Backend API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Wait for server to be ready
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 1: Get top scorer
Write-Host "Test 1: GET /api/players/top-scorers?limit=1" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/players/top-scorers?limit=1" -Method Get
    $player = $response[0]
    
    Write-Host "  Name: $($player.name)" -ForegroundColor White
    Write-Host "  Team: $($player.teamName) ($($player.teamAbbreviation))" -ForegroundColor White
    Write-Host "  Position: $($player.position)" -ForegroundColor White
    Write-Host "  PPG: $($player.points)" -ForegroundColor White
    Write-Host "  RPG: $($player.rebounds)" -ForegroundColor White
    Write-Host "  APG: $($player.assists)" -ForegroundColor White
    Write-Host "  FGM: $($player.fieldGoalsMade)" -ForegroundColor White
    Write-Host "  FGA: $($player.fieldGoalsAttempted)" -ForegroundColor White
    Write-Host "  TS%: $($player.trueShootingPercentage)" -ForegroundColor White
    Write-Host "  eFG%: $($player.effectiveFieldGoalPercentage)" -ForegroundColor White
    Write-Host "  Impact Score: $($player.impactScore)" -ForegroundColor White
    Write-Host "  Age: $($player.age)" -ForegroundColor White
    Write-Host "  Height: $($player.height)" -ForegroundColor White
    Write-Host "  Weight: $($player.weight)" -ForegroundColor White
    Write-Host "  ✅ SUCCESS" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get high efficiency players
Write-Host "Test 2: GET /api/players/high-efficiency?limit=3" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/players/high-efficiency?limit=3" -Method Get
    Write-Host "  Top 3 Efficiency Players:" -ForegroundColor White
    foreach ($player in $response) {
        Write-Host "    - $($player.name): TS% $($player.trueShootingPercentage)" -ForegroundColor White
    }
    Write-Host "  ✅ SUCCESS" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get high impact players
Write-Host "Test 3: GET /api/players/high-impact?limit=3" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/players/high-impact?limit=3" -Method Get
    Write-Host "  Top 3 Impact Players:" -ForegroundColor White
    foreach ($player in $response) {
        Write-Host "    - $($player.name): Impact Score $($player.impactScore)" -ForegroundColor White
    }
    Write-Host "  ✅ SUCCESS" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get single player by ID
Write-Host "Test 4: GET /api/players/1" -ForegroundColor Green
try {
    $player = Invoke-RestMethod -Uri "http://localhost:8080/api/players/1" -Method Get
    Write-Host "  Player ID 1: $($player.name) - $($player.teamName)" -ForegroundColor White
    Write-Host "  Has all extended fields: $(if ($player.trueShootingPercentage) { 'Yes ✅' } else { 'No ❌' })" -ForegroundColor White
}
catch {
    Write-Host "  ❌ FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Backend API Tests Complete ===" -ForegroundColor Cyan
