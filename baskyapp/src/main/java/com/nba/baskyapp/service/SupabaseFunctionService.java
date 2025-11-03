package com.nba.baskyapp.service;

import com.nba.baskyapp.config.SupabaseProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for interacting with Supabase Edge Functions
 * Handles NBA data synchronization via serverless functions
 */
@Service
public class SupabaseFunctionService {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseFunctionService.class);

    private final RestTemplate restTemplate;
    private final SupabaseProperties supabaseProperties;

    public SupabaseFunctionService(RestTemplateBuilder restTemplateBuilder,
            SupabaseProperties supabaseProperties) {
        this.supabaseProperties = supabaseProperties;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(supabaseProperties.getFunctionTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(supabaseProperties.getFunctionTimeoutMs()))
                .build();
    }

    /**
     * Response from Supabase Edge Functions
     */
    public static class FunctionResponse {
        private boolean success;
        private String message;
        private Map<String, Object> data;
        private String error;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Map<String, Object> getData() {
            return data;
        }

        public void setData(Map<String, Object> data) {
            this.data = data;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    /**
     * Trigger the main NBA data sync (teams, players, games)
     * 
     * @return Response from the function
     */
    public FunctionResponse triggerDataSync() {
        String url = supabaseProperties.getFunctionsBaseUrl() + "/nba-data-sync";
        logger.info("Triggering NBA data sync via Supabase function: {}", url);

        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class);

            return parseResponse(response);

        } catch (RestClientException e) {
            logger.error("Error calling nba-data-sync function", e);
            return createErrorResponse("Failed to trigger data sync: " + e.getMessage());
        }
    }

    /**
     * Trigger a batch of box score processing
     * 
     * @param batchSize Number of games to process (default: 20)
     * @return Response from the function
     */
    public FunctionResponse triggerBoxScoreBatch(Integer batchSize) {
        String url = supabaseProperties.getFunctionsBaseUrl() + "/nba-boxscores-batch";
        logger.info("Triggering box score batch processing (batch size: {}): {}", batchSize, url);

        try {
            HttpHeaders headers = createHeaders();

            Map<String, Object> requestBody = new HashMap<>();
            if (batchSize != null) {
                requestBody.put("batchSize", batchSize);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class);

            return parseResponse(response);

        } catch (RestClientException e) {
            logger.error("Error calling nba-boxscores-batch function", e);
            return createErrorResponse("Failed to trigger box score batch: " + e.getMessage());
        }
    }

    /**
     * Trigger multiple box score batches until complete
     * WARNING: This is a long-running operation (can take 2-4 hours)
     * Consider using async processing or scheduling instead
     * 
     * @param maxBatches Maximum number of batches to process (0 = unlimited)
     * @return Response with final status
     */
    public FunctionResponse triggerFullBoxScoreSync(int maxBatches) {
        logger.info("Starting full box score sync (max batches: {})", maxBatches == 0 ? "unlimited" : maxBatches);

        int batchCount = 0;
        int totalProcessed = 0;
        int totalInserted = 0;

        while (maxBatches == 0 || batchCount < maxBatches) {
            FunctionResponse response = triggerBoxScoreBatch(20);

            if (!response.isSuccess()) {
                logger.error("Box score batch {} failed: {}", batchCount + 1, response.getError());
                break;
            }

            batchCount++;

            // Extract metrics from response
            Map<String, Object> data = response.getData();
            if (data != null) {
                totalProcessed += getIntValue(data, "processed");
                totalInserted += getIntValue(data, "inserted");

                int remainingGames = getIntValue(data, "remainingGames");
                logger.info("Batch {} complete. Processed: {}, Remaining: {}",
                        batchCount, totalProcessed, remainingGames);

                // Check if complete
                if (remainingGames == 0) {
                    logger.info("Box score sync complete! Total processed: {}, Total inserted: {}",
                            totalProcessed, totalInserted);

                    FunctionResponse finalResponse = new FunctionResponse();
                    finalResponse.setSuccess(true);
                    finalResponse.setMessage("Full sync complete");
                    Map<String, Object> finalData = new HashMap<>();
                    finalData.put("batchesProcessed", batchCount);
                    finalData.put("totalGamesProcessed", totalProcessed);
                    finalData.put("totalBoxScoresInserted", totalInserted);
                    finalResponse.setData(finalData);
                    return finalResponse;
                }
            }

            // Small delay between batches
            try {
                Thread.sleep(2000); // 2 second delay
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        FunctionResponse response = new FunctionResponse();
        response.setSuccess(true);
        response.setMessage("Partial sync complete (max batches reached)");
        Map<String, Object> data = new HashMap<>();
        data.put("batchesProcessed", batchCount);
        data.put("totalGamesProcessed", totalProcessed);
        data.put("totalBoxScoresInserted", totalInserted);
        response.setData(data);
        return response;
    }

    /**
     * Check if the database is empty (no teams data)
     * This is used to determine if initial sync is needed
     * 
     * @param teamCount Current number of teams in database
     * @return true if database appears empty
     */
    public boolean isDatabaseEmpty(long teamCount) {
        return teamCount == 0;
    }

    /**
     * Perform initial data load if database is empty
     * 
     * @param teamCount Current team count
     * @return true if sync was triggered
     */
    public boolean syncIfEmpty(long teamCount) {
        if (!supabaseProperties.isAutoSyncWhenEmpty()) {
            logger.debug("Auto-sync when empty is disabled");
            return false;
        }

        if (!isDatabaseEmpty(teamCount)) {
            logger.debug("Database is not empty (teams: {}), skipping auto-sync", teamCount);
            return false;
        }

        logger.info("Database is empty, triggering initial data sync...");

        // Trigger main sync (teams, players, games)
        FunctionResponse syncResponse = triggerDataSync();

        if (!syncResponse.isSuccess()) {
            logger.error("Initial data sync failed: {}", syncResponse.getError());
            return false;
        }

        logger.info("Initial data sync completed successfully");

        // Optionally trigger a few box score batches (but not all - that's too slow for
        // startup)
        logger.info("Triggering initial box score batch...");
        FunctionResponse boxScoreResponse = triggerBoxScoreBatch(20);

        if (boxScoreResponse.isSuccess()) {
            logger.info("Initial box score batch completed");
        } else {
            logger.warn("Initial box score batch failed, but continuing: {}", boxScoreResponse.getError());
        }

        return true;
    }

    // Helper methods

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
        return headers;
    }

    private FunctionResponse parseResponse(ResponseEntity<Map> response) {
        FunctionResponse functionResponse = new FunctionResponse();

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();

            functionResponse.setSuccess(getObjectValue(body, "success", Boolean.class, true));
            functionResponse.setMessage(getObjectValue(body, "message", String.class, null));
            functionResponse.setError(getObjectValue(body, "error", String.class, null));
            functionResponse.setData(body);

        } else {
            functionResponse.setSuccess(false);
            functionResponse.setError("Unexpected response: " + response.getStatusCode());
        }

        return functionResponse;
    }

    private FunctionResponse createErrorResponse(String error) {
        FunctionResponse response = new FunctionResponse();
        response.setSuccess(false);
        response.setError(error);
        return response;
    }

    private int getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    @SuppressWarnings("unchecked")
    private <T> T getObjectValue(Map<String, Object> map, String key, Class<T> type, T defaultValue) {
        Object value = map.get(key);
        if (value != null && type.isInstance(value)) {
            return (T) value;
        }
        return defaultValue;
    }
}
