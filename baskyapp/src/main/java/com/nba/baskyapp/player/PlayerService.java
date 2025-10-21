package com.nba.baskyapp.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<PlayerDTO> getAllPlayers() {
        return playerRepository.findAll().stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public PlayerDTO getPlayerById(Long id) {
        return playerRepository.findById(id)
                .map(PlayerDTO::new)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));
    }

    public List<PlayerDTO> getPlayersByTeam(Long teamId) {
        return playerRepository.findByTeamId(teamId).stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PlayerDTO> getStartersByTeam(Long teamId) {
        return playerRepository.findStartersByTeamId(teamId).stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PlayerDTO> getReservesByTeam(Long teamId) {
        return playerRepository.findReservesByTeamId(teamId).stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PlayerDTO> getPlayersByPosition(String position) {
        return playerRepository.findByPosition(position).stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PlayerDTO> getTopScorers(int limit) {
        return playerRepository.findTopScorers().stream()
                .limit(limit)
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }

    public List<PlayerDTO> searchPlayersByName(String name) {
        return playerRepository.searchByName(name).stream()
                .map(PlayerDTO::new)
                .collect(Collectors.toList());
    }
}