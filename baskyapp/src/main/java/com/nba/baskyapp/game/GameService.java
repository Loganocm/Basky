package com.nba.baskyapp.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GameService {

    private final GameRepository gameRepository;

    @Autowired
    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public List<GameWithTeamsDTO> getAllGames() {
        return gameRepository.findAll().stream()
                .map(GameWithTeamsDTO::new)
                .collect(Collectors.toList());
    }

    public GameWithTeamsDTO getGameById(Long id) {
        return gameRepository.findById(id)
                .map(GameWithTeamsDTO::new)
                .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
    }

    public List<GameWithTeamsDTO> getGamesByDate(LocalDate date) {
        return gameRepository.findByGameDate(date).stream()
                .map(GameWithTeamsDTO::new)
                .collect(Collectors.toList());
    }

    public List<GameWithTeamsDTO> getGamesByDateRange(LocalDate startDate, LocalDate endDate) {
        return gameRepository.findByDateRange(startDate, endDate).stream()
                .map(GameWithTeamsDTO::new)
                .collect(Collectors.toList());
    }

    public List<GameWithTeamsDTO> getGamesByTeam(Long teamId) {
        return gameRepository.findByTeamId(teamId).stream()
                .map(GameWithTeamsDTO::new)
                .collect(Collectors.toList());
    }

    public List<GameWithTeamsDTO> getRecentGames(int limit) {
        return gameRepository.findRecentGames().stream()
                .limit(limit)
                .map(GameWithTeamsDTO::new)
                .collect(Collectors.toList());
    }
}