package com.nba.baskyapp.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "http://localhost:4200")
public class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Long id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<PlayerDTO>> getPlayersByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(playerService.getPlayersByTeam(teamId));
    }

    @GetMapping("/team/{teamId}/starters")
    public ResponseEntity<List<PlayerDTO>> getStartersByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(playerService.getStartersByTeam(teamId));
    }

    @GetMapping("/team/{teamId}/reserves")
    public ResponseEntity<List<PlayerDTO>> getReservesByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(playerService.getReservesByTeam(teamId));
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<List<PlayerDTO>> getPlayersByPosition(@PathVariable String position) {
        return ResponseEntity.ok(playerService.getPlayersByPosition(position));
    }

    @GetMapping("/top-scorers")
    public ResponseEntity<List<PlayerDTO>> getTopScorers(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(playerService.getTopScorers(limit));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PlayerDTO>> searchPlayers(@RequestParam String name) {
        return ResponseEntity.ok(playerService.searchPlayersByName(name));
    }
}