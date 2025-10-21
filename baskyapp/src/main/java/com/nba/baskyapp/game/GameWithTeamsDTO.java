package com.nba.baskyapp.game;

import java.time.LocalDate;

public class GameWithTeamsDTO {
    private Long id;
    private LocalDate gameDate;
    private Long homeTeamId;
    private String homeTeamName;
    private String homeTeamAbbreviation;
    private Long awayTeamId;
    private String awayTeamName;
    private String awayTeamAbbreviation;
    private Integer homeScore;
    private Integer awayScore;

    // Constructor from Game entity
    public GameWithTeamsDTO(Game game) {
        this.id = game.getId();
        this.gameDate = game.getGameDate();
        this.homeTeamId = game.getHomeTeam() != null ? game.getHomeTeam().getId() : null;
        this.homeTeamName = game.getHomeTeam() != null ? game.getHomeTeam().getName() : null;
        this.homeTeamAbbreviation = game.getHomeTeam() != null ? game.getHomeTeam().getAbbreviation() : null;
        this.awayTeamId = game.getAwayTeam() != null ? game.getAwayTeam().getId() : null;
        this.awayTeamName = game.getAwayTeam() != null ? game.getAwayTeam().getName() : null;
        this.awayTeamAbbreviation = game.getAwayTeam() != null ? game.getAwayTeam().getAbbreviation() : null;
        this.homeScore = game.getHomeScore();
        this.awayScore = game.getAwayScore();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getGameDate() {
        return gameDate;
    }

    public void setGameDate(LocalDate gameDate) {
        this.gameDate = gameDate;
    }

    public Long getHomeTeamId() {
        return homeTeamId;
    }

    public void setHomeTeamId(Long homeTeamId) {
        this.homeTeamId = homeTeamId;
    }

    public String getHomeTeamName() {
        return homeTeamName;
    }

    public void setHomeTeamName(String homeTeamName) {
        this.homeTeamName = homeTeamName;
    }

    public String getHomeTeamAbbreviation() {
        return homeTeamAbbreviation;
    }

    public void setHomeTeamAbbreviation(String homeTeamAbbreviation) {
        this.homeTeamAbbreviation = homeTeamAbbreviation;
    }

    public Long getAwayTeamId() {
        return awayTeamId;
    }

    public void setAwayTeamId(Long awayTeamId) {
        this.awayTeamId = awayTeamId;
    }

    public String getAwayTeamName() {
        return awayTeamName;
    }

    public void setAwayTeamName(String awayTeamName) {
        this.awayTeamName = awayTeamName;
    }

    public String getAwayTeamAbbreviation() {
        return awayTeamAbbreviation;
    }

    public void setAwayTeamAbbreviation(String awayTeamAbbreviation) {
        this.awayTeamAbbreviation = awayTeamAbbreviation;
    }

    public Integer getHomeScore() {
        return homeScore;
    }

    public void setHomeScore(Integer homeScore) {
        this.homeScore = homeScore;
    }

    public Integer getAwayScore() {
        return awayScore;
    }

    public void setAwayScore(Integer awayScore) {
        this.awayScore = awayScore;
    }
}