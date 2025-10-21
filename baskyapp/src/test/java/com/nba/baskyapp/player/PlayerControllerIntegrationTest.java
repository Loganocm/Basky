package com.nba.baskyapp.player;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlayerControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private PlayerRepository repository;

        @BeforeEach
        void setup() {
                repository.deleteAll();
                Player player1 = new Player("LeBron James");
                player1.setPosition("SF");
                player1.setPoints(25.0);
                repository.save(player1);

                Player player2 = new Player("Stephen Curry");
                player2.setPosition("PG");
                player2.setPoints(30.0);
                repository.save(player2);
        }

        @Test
        void getAll_returnsPlayers() throws Exception {
                mockMvc.perform(get("/api/players"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(2)))
                                .andExpect(jsonPath("$[0].name", notNullValue()));
        }

        @Test
        void getById_found() throws Exception {
                Long id = repository.findAll().get(0).getId();
                mockMvc.perform(get("/api/players/" + id))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id", is(id.intValue())));
        }

        @Test
        void search_byName() throws Exception {
                mockMvc.perform(get("/api/players/search").param("name", "Curry"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].name", containsStringIgnoringCase("Curry")));
        }

        @Test
        void getTopScorers() throws Exception {
                mockMvc.perform(get("/api/players/top-scorers").param("limit", "2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(2)))
                                .andExpect(jsonPath("$[0].points", notNullValue()));
        }
}
