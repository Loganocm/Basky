package com.nba.analytics.service;

import com.nba.analytics.model.Player;
import com.nba.analytics.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {
    
    @Autowired
    private PlayerRepository playerRepository;
    
    // Get all players
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }
    
    // Get player by ID
    public Optional<Player> getPlayerById(Long id) {
        return playerRepository.findById(id);
    }
    
    // Save or update player
    public Player savePlayer(Player player) {
        return playerRepository.save(player);
    }
    
    // Delete player
    public void deletePlayer(Long id) {
        playerRepository.deleteById(id);
    }
    
    // Search players
    public List<Player> searchPlayers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPlayers();
        }
        return playerRepository.searchByNameOrTeam(searchTerm.trim());
    }
    
    // Filter players by team
    public List<Player> getPlayersByTeam(String team) {
        return playerRepository.findByTeam(team);
    }
    
    // Filter players by position
    public List<Player> getPlayersByPosition(String position) {
        return playerRepository.findByPosition(position);
    }
    
    // Filter players by team and position
    public List<Player> getPlayersByTeamAndPosition(String team, String position) {
        return playerRepository.findByTeamAndPosition(team, position);
    }
    
    // Get top players by specific stat
    public Page<Player> getTopPlayersByStat(String statField, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return playerRepository.findTopPlayersByStat(statField, pageable);
    }
    
    // Get leaderboard for specific category
    public List<Player> getLeaderboard(String category, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Player> page;
        
        switch (category.toLowerCase()) {
            case "points":
                page = playerRepository.findTopByPoints(pageable);
                break;
            case "per":
            case "playerefficiencyrating":
                page = playerRepository.findTopByPlayerEfficiencyRating(pageable);
                break;
            case "ts":
            case "trueshootingpercentage":
                page = playerRepository.findTopByTrueShootingPercentage(pageable);
                break;
            case "winshares":
                page = playerRepository.findTopByWinShares(pageable);
                break;
            case "contestedshot":
            case "contestedshotpercentage":
                page = playerRepository.findTopByContestedShotPercentage(pageable);
                break;
            case "clutch":
            case "clutchtimestats":
                page = playerRepository.findTopByClutchTimeStats(pageable);
                break;
            case "deflections":
            case "deflectionspergame":
                page = playerRepository.findTopByDeflectionsPerGame(pageable);
                break;
            default:
                page = playerRepository.findTopPlayersByStat(category, pageable);
                break;
        }
        
        return page.getContent();
    }
    
    // Get players with minimum games played
    public List<Player> getQualifiedPlayers(int minGames) {
        return playerRepository.findPlayersWithMinimumGames(minGames);
    }
    
    // Get all unique teams
    public List<String> getAllTeams() {
        return playerRepository.findAll().stream()
                .map(Player::getTeam)
                .distinct()
                .sorted()
                .toList();
    }
    
    // Get all unique positions
    public List<String> getAllPositions() {
        return playerRepository.findAll().stream()
                .map(Player::getPosition)
                .distinct()
                .sorted()
                .toList();
    }
}