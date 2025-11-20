package com.nba.baskyapp.startup;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

/**
 * Checks database status on application startup and triggers Python scraper if
 * needed
 */
@Component
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${nba.scraper.url:http://localhost:5000/api/nba}")
    private String scraperUrl;

    @Value("${nba.scraper.auto-sync:true}")
    private boolean autoSync;

    /**
     * Called when the application is fully started and ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("Application ready - checking database status...");

        if (!autoSync) {
            logger.info("Auto-sync is disabled");
            return;
        }

        try {
            Long teamCount = getTeamCount();
            logger.info("Current team count: {}", teamCount);

            // If database is empty, trigger Python scraper
            if (teamCount == 0) {
                logger.info("Database is empty, triggering Python scraper...");
                triggerPythonScraper();
            } else {
                logger.info("Database already populated ({} teams)", teamCount);
            }

        } catch (Exception e) {
            logger.error("Error during database initialization", e);
            // Don't fail startup
        }
    }

    /**
     * Trigger the Python Flask API to run the scraper
     */
    private void triggerPythonScraper() {
        try {
            String syncUrl = scraperUrl + "/sync";
            logger.info("Calling Python scraper at: {}", syncUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    syncUrl,
                    HttpMethod.POST,
                    request,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("✅ Python scraper completed successfully");
                logger.debug("Response: {}", response.getBody());
            } else {
                logger.warn("⚠️ Python scraper returned status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("❌ Failed to trigger Python scraper: {}", e.getMessage());
            logger.error("Make sure Flask API is running at: {}", scraperUrl);
        }
    }

    /**
     * Get the current number of teams in the database
     */
    private Long getTeamCount() {
        try {
            return entityManager.createQuery("SELECT COUNT(t) FROM Team t", Long.class)
                    .getSingleResult();
        } catch (Exception e) {
            logger.warn("Could not query team count, assuming empty: {}", e.getMessage());
            return 0L;
        }
    }
}
