package com.nba.baskyapp.boxscore;

import com.nba.baskyapp.game.Game;
import com.nba.baskyapp.player.Player;
import com.nba.baskyapp.team.Team;
import jakarta.persistence.*;

@Entity
@Table(name = "box_scores", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "game_id", "player_id" })
})
public class BoxScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "minutes_played", length = 10)
    private String minutesPlayed;

    @Column(name = "points")
    private Integer points;

    @Column(name = "rebounds")
    private Integer rebounds;

    @Column(name = "assists")
    private Integer assists;

    @Column(name = "steals")
    private Integer steals;

    @Column(name = "blocks")
    private Integer blocks;

    @Column(name = "turnovers")
    private Integer turnovers;

    @Column(name = "field_goals_made")
    private Integer fieldGoalsMade;

    @Column(name = "field_goals_attempted")
    private Integer fieldGoalsAttempted;

    @Column(name = "three_pointers_made")
    private Integer threePointersMade;

    @Column(name = "three_pointers_attempted")
    private Integer threePointersAttempted;

    @Column(name = "free_throws_made")
    private Integer freeThrowsMade;

    @Column(name = "free_throws_attempted")
    private Integer freeThrowsAttempted;

    @Column(name = "plus_minus")
    private Integer plusMinus;

    @Column(name = "is_starter")
    private Boolean isStarter;

    // Constructors
    public BoxScore() {
    }

    public BoxScore(Game game, Player player, Team team, String minutesPlayed,
            Integer points, Integer rebounds, Integer assists, Integer steals,
            Integer blocks, Integer turnovers, Integer fieldGoalsMade,
            Integer fieldGoalsAttempted, Integer threePointersMade,
            Integer threePointersAttempted, Integer freeThrowsMade,
            Integer freeThrowsAttempted, Integer plusMinus, Boolean isStarter) {
        this.game = game;
        this.player = player;
        this.team = team;
        this.minutesPlayed = minutesPlayed;
        this.points = points;
        this.rebounds = rebounds;
        this.assists = assists;
        this.steals = steals;
        this.blocks = blocks;
        this.turnovers = turnovers;
        this.fieldGoalsMade = fieldGoalsMade;
        this.fieldGoalsAttempted = fieldGoalsAttempted;
        this.threePointersMade = threePointersMade;
        this.threePointersAttempted = threePointersAttempted;
        this.freeThrowsMade = freeThrowsMade;
        this.freeThrowsAttempted = freeThrowsAttempted;
        this.plusMinus = plusMinus;
        this.isStarter = isStarter;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
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
