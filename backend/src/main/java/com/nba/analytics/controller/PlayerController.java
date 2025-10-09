package com.nba.analytics.controller;

import com.nba.analytics.model.Player;
import com.nba.analytics.service.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "*")
@Tag(name = "Player Controller", description = "NBA Player Statistics API")
public class PlayerController {
    
    @Autowired
    private PlayerService playerService;
    
    @GetMapping
    @Operation(summary = "Get all players", description = "Retrieve all NBA players with their statistics")
    public ResponseEntity<List<Player>> getAllPlayers() {
        List<Player> players = playerService.getAllPlayers();
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get player by ID", description = "Retrieve a specific player by their ID")
    public ResponseEntity<Player> getPlayerById(
            @Parameter(description = "Player ID") @PathVariable Long id) {
        Optional<Player> player = playerService.getPlayerById(id);
        return player.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create new player", description = "Add a new player to the database")
    public ResponseEntity<Player> createPlayer(@Valid @RequestBody Player player) {
        Player savedPlayer = playerService.savePlayer(player);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlayer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update player", description = "Update an existing player's information")
    public ResponseEntity<Player> updatePlayer(
            @Parameter(description = "Player ID") @PathVariable Long id,
            @Valid @RequestBody Player player) {
        Optional<Player> existingPlayer = playerService.getPlayerById(id);
        if (existingPlayer.isPresent()) {
            player.setId(id);
            Player updatedPlayer = playerService.savePlayer(player);
            return ResponseEntity.ok(updatedPlayer);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete player", description = "Remove a player from the database")
    public ResponseEntity<Void> deletePlayer(
            @Parameter(description = "Player ID") @PathVariable Long id) {
        Optional<Player> player = playerService.getPlayerById(id);
        if (player.isPresent()) {
            playerService.deletePlayer(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search players", description = "Search players by name or team")
    public ResponseEntity<List<Player>> searchPlayers(
            @Parameter(description = "Search term") @RequestParam String q) {
        List<Player> players = playerService.searchPlayers(q);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/team/{team}")
    @Operation(summary = "Get players by team", description = "Retrieve all players from a specific team")
    public ResponseEntity<List<Player>> getPlayersByTeam(
            @Parameter(description = "Team name") @PathVariable String team) {
        List<Player> players = playerService.getPlayersByTeam(team);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/position/{position}")
    @Operation(summary = "Get players by position", description = "Retrieve all players from a specific position")
    public ResponseEntity<List<Player>> getPlayersByPosition(
            @Parameter(description = "Position") @PathVariable String position) {
        List<Player> players = playerService.getPlayersByPosition(position);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/filter")
    @Operation(summary = "Filter players", description = "Filter players by team and/or position")
    public ResponseEntity<List<Player>> filterPlayers(
            @Parameter(description = "Team name") @RequestParam(required = false) String team,
            @Parameter(description = "Position") @RequestParam(required = false) String position) {
        
        List<Player> players;
        if (team != null && position != null) {
            players = playerService.getPlayersByTeamAndPosition(team, position);
        } else if (team != null) {
            players = playerService.getPlayersByTeam(team);
        } else if (position != null) {
            players = playerService.getPlayersByPosition(position);
        } else {
            players = playerService.getAllPlayers();
        }
        
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/leaderboard/{category}")
    @Operation(summary = "Get leaderboard", description = "Get top players in a specific statistical category")
    public ResponseEntity<List<Player>> getLeaderboard(
            @Parameter(description = "Statistical category") @PathVariable String category,
            @Parameter(description = "Number of players to return") @RequestParam(defaultValue = "10") int limit) {
        List<Player> players = playerService.getLeaderboard(category, limit);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/top/{stat}")
    @Operation(summary = "Get top players by stat", description = "Get top players by any statistical field")
    public ResponseEntity<Page<Player>> getTopPlayersByStat(
            @Parameter(description = "Statistical field name") @PathVariable String stat,
            @Parameter(description = "Number of players to return") @RequestParam(defaultValue = "10") int limit) {
        Page<Player> players = playerService.getTopPlayersByStat(stat, limit);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/qualified")
    @Operation(summary = "Get qualified players", description = "Get players with minimum games played")
    public ResponseEntity<List<Player>> getQualifiedPlayers(
            @Parameter(description = "Minimum games played") @RequestParam(defaultValue = "50") int minGames) {
        List<Player> players = playerService.getQualifiedPlayers(minGames);
        return ResponseEntity.ok(players);
    }
    
    @GetMapping("/teams")
    @Operation(summary = "Get all teams", description = "Get list of all unique team names")
    public ResponseEntity<List<String>> getAllTeams() {
        List<String> teams = playerService.getAllTeams();
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/positions")
    @Operation(summary = "Get all positions", description = "Get list of all unique positions")
    public ResponseEntity<List<String>> getAllPositions() {
        List<String> positions = playerService.getAllPositions();
        return ResponseEntity.ok(positions);
    }
}