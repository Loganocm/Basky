# Process All NBA Box Scores in Batches
# Repeatedly calls the batch processor until all games are complete
# Usage: .\process-all-boxscores.ps1 -ProjectRef YOUR_PROJECT_REF -ApiKey YOUR_ANON_KEY

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRef,
    
    [Parameter(Mandatory = $true)]
    [string]$ApiKey,
    
    [int]$BatchSize = 20,
    
    [int]$DelaySeconds = 5
)

$endpoint = "https://$ProjectRef.supabase.co/functions/v1/nba-boxscores-batch"
$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type"  = "application/json"
}

$batchNumber = 1
$totalProcessed = 0
$totalInserted = 0
$startTime = Get-Date

Write-Host "🏀 NBA Box Score Batch Processor" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "Batch Size: $BatchSize games" -ForegroundColor Gray
Write-Host ""

while ($true) {
    Write-Host "📦 Batch #$batchNumber - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
    
    try {
        $body = @{ batchSize = $BatchSize } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -ErrorAction Stop
        
        $totalProcessed += $response.processed
        $totalInserted += $response.inserted
        
        Write-Host "  ✅ Processed: $($response.processed) games" -ForegroundColor Green
        Write-Host "  📊 Inserted: $($response.inserted) box scores" -ForegroundColor Green
        
        if ($response.failed -gt 0) {
            Write-Host "  ⚠️  Failed: $($response.failed) games" -ForegroundColor Red
        }
        
        if ($response.skipped -gt 0) {
            Write-Host "  ⏭️  Skipped: $($response.skipped) games (no data)" -ForegroundColor Yellow
        }
        
        Write-Host "  ⏱️  Execution time: $([math]::Round($response.executionTime / 1000, 1))s" -ForegroundColor Gray
        Write-Host "  📋 Remaining: $($response.remainingGames) games" -ForegroundColor Cyan
        Write-Host "  📈 Progress: $($response.percentComplete)% complete" -ForegroundColor Cyan
        
        if ($response.remainingGames -eq 0) {
            Write-Host ""
            Write-Host "✅ All games processed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Summary:" -ForegroundColor Cyan
            Write-Host "  Total Batches: $batchNumber" -ForegroundColor White
            Write-Host "  Total Games: $totalProcessed" -ForegroundColor White
            Write-Host "  Total Box Scores: $totalInserted" -ForegroundColor White
            
            $elapsed = (Get-Date) - $startTime
            Write-Host "  Total Time: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor White
            break
        }
        
        Write-Host ""
        Write-Host "  Waiting $DelaySeconds seconds before next batch..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
        
        $batchNumber++
        
    }
    catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Retrying in $DelaySeconds seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host ""
Write-Host "🎉 Box score processing complete!" -ForegroundColor Green
