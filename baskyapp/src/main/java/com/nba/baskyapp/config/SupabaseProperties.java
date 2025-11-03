package com.nba.baskyapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Supabase Edge Functions integration
 */
@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {

    /**
     * Supabase project URL (e.g., https://yourproject.supabase.co)
     */
    private String url;

    /**
     * Supabase API key (use service_role key for backend-to-backend)
     */
    private String serviceRoleKey;

    /**
     * Supabase anonymous key (for public operations)
     */
    private String anonKey;

    /**
     * Enable/disable automatic data sync on startup
     */
    private boolean autoSyncOnStartup = false;

    /**
     * Enable/disable automatic sync when database is empty
     */
    private boolean autoSyncWhenEmpty = true;

    /**
     * Timeout for function calls (milliseconds)
     */
    private int functionTimeoutMs = 300000; // 5 minutes

    // Getters and Setters
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
    }

    public String getAnonKey() {
        return anonKey;
    }

    public void setAnonKey(String anonKey) {
        this.anonKey = anonKey;
    }

    public boolean isAutoSyncOnStartup() {
        return autoSyncOnStartup;
    }

    public void setAutoSyncOnStartup(boolean autoSyncOnStartup) {
        this.autoSyncOnStartup = autoSyncOnStartup;
    }

    public boolean isAutoSyncWhenEmpty() {
        return autoSyncWhenEmpty;
    }

    public void setAutoSyncWhenEmpty(boolean autoSyncWhenEmpty) {
        this.autoSyncWhenEmpty = autoSyncWhenEmpty;
    }

    public int getFunctionTimeoutMs() {
        return functionTimeoutMs;
    }

    public void setFunctionTimeoutMs(int functionTimeoutMs) {
        this.functionTimeoutMs = functionTimeoutMs;
    }

    /**
     * Get the base URL for Edge Functions
     */
    public String getFunctionsBaseUrl() {
        if (url == null) {
            return null;
        }
        return url + "/functions/v1";
    }
}
