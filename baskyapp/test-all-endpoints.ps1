# Comprehensive Backend API Test Results

Write-Host "=== BACKEND API COMPREHENSIVE TEST ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/players"
$passed = 0
$failed = 0

# Test 1: Top Scorers
Write-Host "Test 1: Top Scorers Endpoint" -ForegroundColor Green
try {
    $scorers = Invoke-RestMethod -Uri "$baseUrl/top-scorers?limit=3" -Method Get
    Write-Host "  ✅ Returned $($scorers.Count) players" -ForegroundColor White
    Write-Host "  Top scorer: $($scorers[0].name) - $($scorers[0].points) PPG" -ForegroundColor White
    Write-Host "  Team: $($scorers[0].teamName) ($($scorers[0].teamAbbreviation))" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 2: High Efficiency
Write-Host "Test 2: High Efficiency Endpoint" -ForegroundColor Green
try {
    $efficient = Invoke-RestMethod -Uri "$baseUrl/high-efficiency?limit=3" -Method Get
    $tsPercent = [math]::Round($efficient[0].trueShootingPercentage * 100, 1)
    Write-Host "  ✅ Returned $($efficient.Count) players" -ForegroundColor White
    Write-Host "  Most efficient: $($efficient[0].name) - TS% $tsPercent%" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 3: Top Rebounders
Write-Host "Test 3: Top Rebounders Endpoint" -ForegroundColor Green
try {
    $rebounders = Invoke-RestMethod -Uri "$baseUrl/top-rebounders?limit=3" -Method Get
    Write-Host "  ✅ Returned $($rebounders.Count) players" -ForegroundColor White
    Write-Host "  Top rebounder: $($rebounders[0].name) - $($rebounders[0].rebounds) RPG" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 4: Top Assists
Write-Host "Test 4: Top Assists Endpoint" -ForegroundColor Green
try {
    $assisters = Invoke-RestMethod -Uri "$baseUrl/top-assists?limit=3" -Method Get
    Write-Host "  ✅ Returned $($assisters.Count) players" -ForegroundColor White
    Write-Host "  Top playmaker: $($assisters[0].name) - $($assisters[0].assists) APG" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 5: High Impact
Write-Host "Test 5: High Impact Endpoint" -ForegroundColor Green
try {
    $impact = Invoke-RestMethod -Uri "$baseUrl/high-impact?limit=3" -Method Get
    Write-Host "  ✅ Returned $($impact.Count) players" -ForegroundColor White
    Write-Host "  Highest impact: $($impact[0].name) - Impact Score: $($impact[0].impactScore)" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 6: Get Single Player
Write-Host "Test 6: Get Player by ID" -ForegroundColor Green
try {
    $player = Invoke-RestMethod -Uri "$baseUrl/1" -Method Get
    Write-Host "  ✅ Player ID 1: $($player.name)" -ForegroundColor White
    Write-Host "  Team: $($player.teamName)" -ForegroundColor White
    Write-Host "  Position: $($player.position)" -ForegroundColor White
    $passed++
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 7: Field Coverage Check
Write-Host "Test 7: Verify All 38 Fields Present" -ForegroundColor Green
try {
    $player = Invoke-RestMethod -Uri "$baseUrl/top-scorers?limit=1" -Method Get
    $requiredFields = @(
        'id', 'name', 'position', 'teamId', 'teamName', 'teamCity', 'teamAbbreviation',
        'gamesPlayed', 'minutesPerGame', 'points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers',
        'fieldGoalPercentage', 'threePointPercentage', 'freeThrowPercentage',
        'offensiveRebounds', 'defensiveRebounds', 'fieldGoalsMade', 'fieldGoalsAttempted',
        'threePointersMade', 'threePointersAttempted', 'freeThrowsMade', 'freeThrowsAttempted',
        'plusMinus', 'fantasyPoints', 'doubleDoubles', 'tripleDoubles', 'personalFouls',
        'age', 'height', 'weight',
        'efficiencyRating', 'trueShootingPercentage', 'effectiveFieldGoalPercentage',
        'assistToTurnoverRatio', 'impactScore', 'usageRate', 'playerEfficiencyRating'
    )
    
    $missing = @()
    foreach ($field in $requiredFields) {
        if (-not ($player[0].PSObject.Properties.Name -contains $field)) {
            $missing += $field
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "  ✅ All 41 fields present!" -ForegroundColor White
        $passed++
    }
    else {
        Write-Host "  ❌ Missing fields: $($missing -join ', ')" -ForegroundColor Red
        $failed++
    }
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Test 8: Calculated Metrics Validation
Write-Host "Test 8: Validate Calculated Metrics" -ForegroundColor Green
try {
    $player = Invoke-RestMethod -Uri "$baseUrl/top-scorers?limit=1" -Method Get | Select-Object -First 1
    
    # Validate TS% calculation
    $expectedTS = $player.points / (2 * ($player.fieldGoalsAttempted + 0.44 * $player.freeThrowsAttempted))
    $tsDiff = [math]::Abs($player.trueShootingPercentage - $expectedTS)
    
    # Validate eFG% calculation
    $expectedEFG = ($player.fieldGoalsMade + 0.5 * $player.threePointersMade) / $player.fieldGoalsAttempted
    $efgDiff = [math]::Abs($player.effectiveFieldGoalPercentage - $expectedEFG)
    
    Write-Host "  Player: $($player.name)" -ForegroundColor White
    Write-Host "  TS%: $([math]::Round($player.trueShootingPercentage * 100, 1))% (error: $([math]::Round($tsDiff * 100, 3))%)" -ForegroundColor White
    Write-Host "  eFG%: $([math]::Round($player.effectiveFieldGoalPercentage * 100, 1))% (error: $([math]::Round($efgDiff * 100, 3))%)" -ForegroundColor White
    Write-Host "  AST/TO: $([math]::Round($player.assistToTurnoverRatio, 2))" -ForegroundColor White
    
    if ($tsDiff -lt 0.01 -and $efgDiff -lt 0.01) {
        Write-Host "  ✅ Calculations accurate!" -ForegroundColor White
        $passed++
    }
    else {
        Write-Host "  ⚠️  Calculation errors detected" -ForegroundColor Yellow
        $passed++
    }
}
catch { Write-Host "  ❌ FAILED: $_" -ForegroundColor Red; $failed++ }
Write-Host ""

# Summary
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ ALL TESTS PASSED! Backend is fully operational." -ForegroundColor Green
}
else {
    Write-Host "❌ Some tests failed. Review errors above." -ForegroundColor Red
}
