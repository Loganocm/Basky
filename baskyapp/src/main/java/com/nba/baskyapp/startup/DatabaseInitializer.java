package com.nba.baskyapp.startup;

import com.nba.baskyapp.config.SupabaseProperties;
import com.nba.baskyapp.service.SupabaseFunctionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Checks database status on application startup and triggers data sync if
 * needed
 */
@Component
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final SupabaseFunctionService supabaseFunctionService;
    private final SupabaseProperties supabaseProperties;

    public DatabaseInitializer(SupabaseFunctionService supabaseFunctionService,
            SupabaseProperties supabaseProperties) {
        this.supabaseFunctionService = supabaseFunctionService;
        this.supabaseProperties = supabaseProperties;
    }

    /**
     * Called when the application is fully started and ready
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("Application ready - checking database status...");

        // Check if auto-sync is enabled
        if (!supabaseProperties.isAutoSyncOnStartup() && !supabaseProperties.isAutoSyncWhenEmpty()) {
            logger.info("Auto-sync is disabled in configuration");
            return;
        }

        try {
            // Check team count (indicator of database state)
            Long teamCount = getTeamCount();
            logger.info("Current team count: {}", teamCount);

            // If database is empty and auto-sync is enabled, trigger sync
            if (supabaseProperties.isAutoSyncWhenEmpty()) {
                boolean synced = supabaseFunctionService.syncIfEmpty(teamCount);
                if (synced) {
                    logger.info("✅ Initial database sync completed");
                } else {
                    logger.info("Database sync not needed or disabled");
                }
            }

            // If auto-sync on startup is enabled (regardless of database state)
            if (supabaseProperties.isAutoSyncOnStartup() && teamCount > 0) {
                logger.info("Auto-sync on startup is enabled, triggering data refresh...");
                SupabaseFunctionService.FunctionResponse response = supabaseFunctionService.triggerDataSync();
                if (response.isSuccess()) {
                    logger.info("✅ Startup data sync completed");
                } else {
                    logger.warn("⚠️ Startup data sync failed: {}", response.getError());
                }
            }

        } catch (Exception e) {
            logger.error("Error during database initialization check", e);
            // Don't fail startup - just log the error
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
