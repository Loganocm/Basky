package com.nba.baskyapp.boxscore;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BoxScoreDTO {
    private Long id;
    private Long gameId;
    private Long playerId;
    private String playerName;
    private Long teamId;
    private String teamName;
    private String minutesPlayed;
    private Integer points;
    private Integer rebounds;
    private Integer assists;
    private Integer steals;
    private Integer blocks;
    private Integer turnovers;
    private Integer fieldGoalsMade;
    private Integer fieldGoalsAttempted;
    private Integer threePointersMade;
    private Integer threePointersAttempted;
    private Integer freeThrowsMade;
    private Integer freeThrowsAttempted;
    private Integer plusMinus;

    @JsonProperty("isStarter")
    private Boolean isStarter;

    // Constructor from BoxScore entity
    public BoxScoreDTO(BoxScore boxScore) {
        this.id = boxScore.getId();
        // Safely access lazy-loaded game - may be null if not fetched
        try {
            this.gameId = boxScore.getGame() != null ? boxScore.getGame().getId() : null;
        } catch (Exception e) {
            this.gameId = null;
        }
        this.playerId = boxScore.getPlayer().getId();
        this.playerName = boxScore.getPlayer().getName();
        this.teamId = boxScore.getTeam().getId();
        this.teamName = boxScore.getTeam().getName();
        this.minutesPlayed = boxScore.getMinutesPlayed();
        this.points = boxScore.getPoints();
        this.rebounds = boxScore.getRebounds();
        this.assists = boxScore.getAssists();
        this.steals = boxScore.getSteals();
        this.blocks = boxScore.getBlocks();
        this.turnovers = boxScore.getTurnovers();
        this.fieldGoalsMade = boxScore.getFieldGoalsMade();
        this.fieldGoalsAttempted = boxScore.getFieldGoalsAttempted();
        this.threePointersMade = boxScore.getThreePointersMade();
        this.threePointersAttempted = boxScore.getThreePointersAttempted();
        this.freeThrowsMade = boxScore.getFreeThrowsMade();
        this.freeThrowsAttempted = boxScore.getFreeThrowsAttempted();
        this.plusMinus = boxScore.getPlusMinus();
        this.isStarter = boxScore.getIsStarter();
    }

    // Default constructor
    public BoxScoreDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getMinutesPlayed() {
        return minutesPlayed;
    }

    public void setMinutesPlayed(String minutesPlayed) {
        this.minutesPlayed = minutesPlayed;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getRebounds() {
        return rebounds;
    }

    public void setRebounds(Integer rebounds) {
        this.rebounds = rebounds;
    }

    public Integer getAssists() {
        return assists;
    }

    public void setAssists(Integer assists) {
        this.assists = assists;
    }

    public Integer getSteals() {
        return steals;
    }

    public void setSteals(Integer steals) {
        this.steals = steals;
    }

    public Integer getBlocks() {
        return blocks;
    }

    public void setBlocks(Integer blocks) {
        this.blocks = blocks;
    }

    public Integer getTurnovers() {
        return turnovers;
    }

    public void setTurnovers(Integer turnovers) {
        this.turnovers = turnovers;
    }

    public Integer getFieldGoalsMade() {
        return fieldGoalsMade;
    }

    public void setFieldGoalsMade(Integer fieldGoalsMade) {
        this.fieldGoalsMade = fieldGoalsMade;
    }

    public Integer getFieldGoalsAttempted() {
        return fieldGoalsAttempted;
    }

    public void setFieldGoalsAttempted(Integer fieldGoalsAttempted) {
        this.fieldGoalsAttempted = fieldGoalsAttempted;
    }

    public Integer getThreePointersMade() {
        return threePointersMade;
    }

    public void setThreePointersMade(Integer threePointersMade) {
        this.threePointersMade = threePointersMade;
    }

    public Integer getThreePointersAttempted() {
        return threePointersAttempted;
    }

    public void setThreePointersAttempted(Integer threePointersAttempted) {
        this.threePointersAttempted = threePointersAttempted;
    }

    public Integer getFreeThrowsMade() {
        return freeThrowsMade;
    }

    public void setFreeThrowsMade(Integer freeThrowsMade) {
        this.freeThrowsMade = freeThrowsMade;
    }

    public Integer getFreeThrowsAttempted() {
        return freeThrowsAttempted;
    }

    public void setFreeThrowsAttempted(Integer freeThrowsAttempted) {
        this.freeThrowsAttempted = freeThrowsAttempted;
    }

    public Integer getPlusMinus() {
        return plusMinus;
    }

    public void setPlusMinus(Integer plusMinus) {
        this.plusMinus = plusMinus;
    }

    public Boolean getIsStarter() {
        return isStarter;
    }

    public void setIsStarter(Boolean isStarter) {
        this.isStarter = isStarter;
    }
}
