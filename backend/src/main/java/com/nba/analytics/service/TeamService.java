package com.nba.analytics.service;

import com.nba.analytics.model.Team;
import com.nba.analytics.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    // Get all teams
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
    
    // Get team by ID
    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }
    
    // Get team by name
    public Optional<Team> getTeamByName(String name) {
        return teamRepository.findByName(name);
    }
    
    // Save or update team
    public Team saveTeam(Team team) {
        return teamRepository.save(team);
    }
    
    // Delete team
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
    
    // Get teams ordered by wins
    public List<Team> getTeamsByWins() {
        return teamRepository.findAllOrderByWinsDesc();
    }
    
    // Get teams ordered by net rating
    public List<Team> getTeamsByNetRating() {
        return teamRepository.findAllOrderByNetRatingDesc();
    }
    
    // Get top offensive teams
    public List<Team> getTopOffensiveTeams(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Team> page = teamRepository.findTopByOffensiveRating(pageable);
        return page.getContent();
    }
    
    // Get top defensive teams
    public List<Team> getTopDefensiveTeams(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Team> page = teamRepository.findTopByDefensiveRating(pageable);
        return page.getContent();
    }
    
    // Get playoff teams (teams with win percentage > 0.500)
    public List<Team> getPlayoffTeams() {
        return teamRepository.findByWinPercentageGreaterThan(0.500);
    }
}