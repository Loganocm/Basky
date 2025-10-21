package com.nba.baskyapp.team;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeamControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeamRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        repository.deleteAll();
        repository.save(new Team("Lakers", "Los Angeles", "LAL"));
        repository.save(new Team("Warriors", "San Francisco", "GSW"));
    }

    @Test
    void getAll_returnsTeams() throws Exception {
        mockMvc.perform(get("/api/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", notNullValue()));
    }

    @Test
    void getById_foundAndNotFound() throws Exception {
        Long id = repository.findAll().get(0).getId();
        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(id.intValue())));

        mockMvc.perform(get("/api/teams/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void search_byNameAndAbbr() throws Exception {
        mockMvc.perform(get("/api/teams/search").param("name", "lak"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", containsStringIgnoringCase("lak")));

        mockMvc.perform(get("/api/teams/search").param("abbr", "GSW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].abbreviation", is("GSW")));
    }

    @Test
    void create_update_delete_flow() throws Exception {
        Team newTeam = new Team("Nuggets", "Denver", "DEN");
        String body = objectMapper.writeValueAsString(newTeam);

        mockMvc.perform(post("/api/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.abbreviation", is("DEN")));

        Long id = repository.findByAbbreviationIgnoreCase("DEN").get(0).getId();
        Team update = new Team("Nuggets", "Denver", "DEN");
        update.setCity("Denver Metro");
        String updateBody = objectMapper.writeValueAsString(update);

        mockMvc.perform(put("/api/teams/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city", is("Denver Metro")));

        mockMvc.perform(delete("/api/teams/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isNotFound());
    }
}