package com.nba.baskyapp.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private GameRepository repository;

        private LocalDate today;

        @BeforeEach
        void setup() {
                repository.deleteAll();
                today = LocalDate.now();
                // Games need Team objects, not IDs - tests will use existing data from database
        }

        @Test
        void getAll_returnsGames() throws Exception {
                mockMvc.perform(get("/api/games"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        void getRecentGames() throws Exception {
                mockMvc.perform(get("/api/games/recent").param("limit", "10"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        void getByDateRange() throws Exception {
                LocalDate startDate = today.minusDays(30);
                LocalDate endDate = today;
                mockMvc.perform(get("/api/games/date-range")
                                .param("startDate", startDate.toString())
                                .param("endDate", endDate.toString()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }
}