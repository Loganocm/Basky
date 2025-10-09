package com.nba.analytics.controller;

import com.nba.analytics.model.Team;
import com.nba.analytics.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
@Tag(name = "Team Controller", description = "NBA Team Statistics API")
public class TeamController {
    
    @Autowired
    private TeamService teamService;
    
    @GetMapping
    @Operation(summary = "Get all teams", description = "Retrieve all NBA teams with their statistics")
    public ResponseEntity<List<Team>> getAllTeams() {
        List<Team> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get team by ID", description = "Retrieve a specific team by their ID")
    public ResponseEntity<Team> getTeamById(
            @Parameter(description = "Team ID") @PathVariable Long id) {
        Optional<Team> team = teamService.getTeamById(id);
        return team.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    @Operation(summary = "Get team by name", description = "Retrieve a specific team by their name")
    public ResponseEntity<Team> getTeamByName(
            @Parameter(description = "Team name") @PathVariable String name) {
        Optional<Team> team = teamService.getTeamByName(name);
        return team.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create new team", description = "Add a new team to the database")
    public ResponseEntity<Team> createTeam(@Valid @RequestBody Team team) {
        Team savedTeam = teamService.saveTeam(team);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTeam);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update team", description = "Update an existing team's information")
    public ResponseEntity<Team> updateTeam(
            @Parameter(description = "Team ID") @PathVariable Long id,
            @Valid @RequestBody Team team) {
        Optional<Team> existingTeam = teamService.getTeamById(id);
        if (existingTeam.isPresent()) {
            team.setId(id);
            Team updatedTeam = teamService.saveTeam(team);
            return ResponseEntity.ok(updatedTeam);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete team", description = "Remove a team from the database")
    public ResponseEntity<Void> deleteTeam(
            @Parameter(description = "Team ID") @PathVariable Long id) {
        Optional<Team> team = teamService.getTeamById(id);
        if (team.isPresent()) {
            teamService.deleteTeam(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/standings")
    @Operation(summary = "Get team standings", description = "Get teams ordered by wins")
    public ResponseEntity<List<Team>> getStandings() {
        List<Team> teams = teamService.getTeamsByWins();
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/net-rating")
    @Operation(summary = "Get teams by net rating", description = "Get teams ordered by net rating")
    public ResponseEntity<List<Team>> getTeamsByNetRating() {
        List<Team> teams = teamService.getTeamsByNetRating();
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/top-offense")
    @Operation(summary = "Get top offensive teams", description = "Get teams with highest offensive rating")
    public ResponseEntity<List<Team>> getTopOffensiveTeams(
            @Parameter(description = "Number of teams to return") @RequestParam(defaultValue = "10") int limit) {
        List<Team> teams = teamService.getTopOffensiveTeams(limit);
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/top-defense")
    @Operation(summary = "Get top defensive teams", description = "Get teams with best defensive rating")
    public ResponseEntity<List<Team>> getTopDefensiveTeams(
            @Parameter(description = "Number of teams to return") @RequestParam(defaultValue = "10") int limit) {
        List<Team> teams = teamService.getTopDefensiveTeams(limit);
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/playoff-teams")
    @Operation(summary = "Get playoff teams", description = "Get teams with winning record")
    public ResponseEntity<List<Team>> getPlayoffTeams() {
        List<Team> teams = teamService.getPlayoffTeams();
        return ResponseEntity.ok(teams);
    }
}