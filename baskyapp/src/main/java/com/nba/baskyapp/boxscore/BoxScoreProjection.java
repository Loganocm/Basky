package com.nba.baskyapp.boxscore;

public interface BoxScoreProjection {
    Long getId();

    Long getGameId();

    Long getPlayerId();

    Long getTeamId();

    String getMinutesPlayed();

    Integer getPoints();

    Integer getRebounds();

    Integer getAssists();

    Integer getSteals();

    Integer getBlocks();

    Integer getTurnovers();

    Integer getFieldGoalsMade();

    Integer getFieldGoalsAttempted();

    Integer getThreePointersMade();

    Integer getThreePointersAttempted();

    Integer getFreeThrowsMade();

    Integer getFreeThrowsAttempted();

    Integer getPlusMinus();

    Boolean getIsStarter();
}
