package com.nba.baskyapp.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:4200")
public class GameController {

    private final GameService gameService;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<GameWithTeamsDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameWithTeamsDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<GameWithTeamsDTO>> getGamesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(gameService.getGamesByDate(date));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<GameWithTeamsDTO>> getGamesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(gameService.getGamesByDateRange(startDate, endDate));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<GameWithTeamsDTO>> getGamesByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(gameService.getGamesByTeam(teamId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<GameWithTeamsDTO>> getRecentGames(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(gameService.getRecentGames(limit));
    }
}