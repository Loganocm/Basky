package com.nba.baskyapp.controller;

import com.nba.baskyapp.service.SupabaseFunctionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST API endpoints for triggering data synchronization
 * Can be called manually or by scheduled jobs
 */
@RestController
@RequestMapping("/api/admin/sync")
public class DataSyncController {

    private final SupabaseFunctionService supabaseFunctionService;

    public DataSyncController(SupabaseFunctionService supabaseFunctionService) {
        this.supabaseFunctionService = supabaseFunctionService;
    }

    /**
     * Trigger the main NBA data sync (teams, players, games)
     * GET /api/admin/sync/data
     */
    @PostMapping("/data")
    public ResponseEntity<Map<String, Object>> triggerDataSync() {
        SupabaseFunctionService.FunctionResponse response = supabaseFunctionService.triggerDataSync();
        return buildResponse(response);
    }

    /**
     * Trigger a batch of box score processing
     * POST /api/admin/sync/boxscores
     * 
     * @param batchSize Optional batch size (default: 20)
     */
    @PostMapping("/boxscores")
    public ResponseEntity<Map<String, Object>> triggerBoxScoreBatch(
            @RequestParam(required = false, defaultValue = "20") Integer batchSize) {

        SupabaseFunctionService.FunctionResponse response = supabaseFunctionService.triggerBoxScoreBatch(batchSize);

        return buildResponse(response);
    }

    /**
     * Trigger full box score sync (WARNING: long-running operation)
     * POST /api/admin/sync/boxscores/full
     * 
     * @param maxBatches Maximum batches to process (0 = unlimited)
     */
    @PostMapping("/boxscores/full")
    public ResponseEntity<Map<String, Object>> triggerFullBoxScoreSync(
            @RequestParam(required = false, defaultValue = "0") Integer maxBatches) {

        SupabaseFunctionService.FunctionResponse response = supabaseFunctionService.triggerFullBoxScoreSync(maxBatches);

        return buildResponse(response);
    }

    /**
     * Get sync status
     * GET /api/admin/sync/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSyncStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("message", "Sync endpoints are available");
        status.put("endpoints", Map.of(
                "data", "POST /api/admin/sync/data - Sync teams, players, games",
                "boxscores", "POST /api/admin/sync/boxscores?batchSize=20 - Process box score batch",
                "full", "POST /api/admin/sync/boxscores/full?maxBatches=10 - Full box score sync"));
        return ResponseEntity.ok(status);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(SupabaseFunctionService.FunctionResponse response) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", response.isSuccess());

        if (response.getMessage() != null) {
            result.put("message", response.getMessage());
        }

        if (response.getError() != null) {
            result.put("error", response.getError());
        }

        if (response.getData() != null) {
            result.put("data", response.getData());
        }

        if (response.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }
}
