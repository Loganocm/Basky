package com.nba.analytics.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Team name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Record is required")
    @Column(nullable = false)
    private String record;

    @Min(value = 0, message = "Wins must be non-negative")
    @Column(nullable = false)
    private Integer wins;

    @Min(value = 0, message = "Losses must be non-negative")
    @Column(nullable = false)
    private Integer losses;

    @DecimalMin(value = "0.0", message = "Win percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Win percentage cannot exceed 1.0")
    @Column(name = "win_percentage", precision = 5, scale = 4)
    private BigDecimal winPercentage;

    @DecimalMin(value = "0.0", message = "Points per game must be non-negative")
    @Column(name = "points_per_game", precision = 5, scale = 2)
    private BigDecimal pointsPerGame;

    @DecimalMin(value = "0.0", message = "Points against must be non-negative")
    @Column(name = "points_against", precision = 5, scale = 2)
    private BigDecimal pointsAgainst;

    @DecimalMin(value = "0.0", message = "Rebounds per game must be non-negative")
    @Column(name = "rebounds_per_game", precision = 5, scale = 2)
    private BigDecimal reboundsPerGame;

    @DecimalMin(value = "0.0", message = "Assists per game must be non-negative")
    @Column(name = "assists_per_game", precision = 5, scale = 2)
    private BigDecimal assistsPerGame;

    @DecimalMin(value = "0.0", message = "Field goal percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Field goal percentage cannot exceed 1.0")
    @Column(name = "field_goal_percentage", precision = 5, scale = 4)
    private BigDecimal fieldGoalPercentage;

    @DecimalMin(value = "0.0", message = "Three point percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Three point percentage cannot exceed 1.0")
    @Column(name = "three_point_percentage", precision = 5, scale = 4)
    private BigDecimal threePointPercentage;

    @DecimalMin(value = "0.0", message = "Offensive rating must be non-negative")
    @Column(name = "offensive_rating", precision = 5, scale = 2)
    private BigDecimal offensiveRating;

    @DecimalMin(value = "0.0", message = "Defensive rating must be non-negative")
    @Column(name = "defensive_rating", precision = 5, scale = 2)
    private BigDecimal defensiveRating;

    @Column(name = "net_rating", precision = 6, scale = 2)
    private BigDecimal netRating;

    @DecimalMin(value = "0.0", message = "Pace must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal pace;

    @DecimalMin(value = "0.0", message = "Effective field goal percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Effective field goal percentage cannot exceed 1.0")
    @Column(name = "effective_field_goal_percentage", precision = 5, scale = 4)
    private BigDecimal effectiveFieldGoalPercentage;

    @DecimalMin(value = "0.0", message = "Turnover rate must be non-negative")
    @Column(name = "turnover_rate", precision = 5, scale = 4)
    private BigDecimal turnoverRate;

    @DecimalMin(value = "0.0", message = "Rebound rate must be non-negative")
    @Column(name = "rebound_rate", precision = 5, scale = 4)
    private BigDecimal reboundRate;

    // Constructors
    public Team() {}

    public Team(String name, String record, Integer wins, Integer losses) {
        this.name = name;
        this.record = record;
        this.wins = wins;
        this.losses = losses;
        this.winPercentage = BigDecimal.valueOf((double) wins / (wins + losses));
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRecord() { return record; }
    public void setRecord(String record) { this.record = record; }

    public Integer getWins() { return wins; }
    public void setWins(Integer wins) { this.wins = wins; }

    public Integer getLosses() { return losses; }
    public void setLosses(Integer losses) { this.losses = losses; }

    public BigDecimal getWinPercentage() { return winPercentage; }
    public void setWinPercentage(BigDecimal winPercentage) { this.winPercentage = winPercentage; }

    public BigDecimal getPointsPerGame() { return pointsPerGame; }
    public void setPointsPerGame(BigDecimal pointsPerGame) { this.pointsPerGame = pointsPerGame; }

    public BigDecimal getPointsAgainst() { return pointsAgainst; }
    public void setPointsAgainst(BigDecimal pointsAgainst) { this.pointsAgainst = pointsAgainst; }

    public BigDecimal getReboundsPerGame() { return reboundsPerGame; }
    public void setReboundsPerGame(BigDecimal reboundsPerGame) { this.reboundsPerGame = reboundsPerGame; }

    public BigDecimal getAssistsPerGame() { return assistsPerGame; }
    public void setAssistsPerGame(BigDecimal assistsPerGame) { this.assistsPerGame = assistsPerGame; }

    public BigDecimal getFieldGoalPercentage() { return fieldGoalPercentage; }
    public void setFieldGoalPercentage(BigDecimal fieldGoalPercentage) { this.fieldGoalPercentage = fieldGoalPercentage; }

    public BigDecimal getThreePointPercentage() { return threePointPercentage; }
    public void setThreePointPercentage(BigDecimal threePointPercentage) { this.threePointPercentage = threePointPercentage; }

    public BigDecimal getOffensiveRating() { return offensiveRating; }
    public void setOffensiveRating(BigDecimal offensiveRating) { this.offensiveRating = offensiveRating; }

    public BigDecimal getDefensiveRating() { return defensiveRating; }
    public void setDefensiveRating(BigDecimal defensiveRating) { this.defensiveRating = defensiveRating; }

    public BigDecimal getNetRating() { return netRating; }
    public void setNetRating(BigDecimal netRating) { this.netRating = netRating; }

    public BigDecimal getPace() { return pace; }
    public void setPace(BigDecimal pace) { this.pace = pace; }

    public BigDecimal getEffectiveFieldGoalPercentage() { return effectiveFieldGoalPercentage; }
    public void setEffectiveFieldGoalPercentage(BigDecimal effectiveFieldGoalPercentage) { this.effectiveFieldGoalPercentage = effectiveFieldGoalPercentage; }

    public BigDecimal getTurnoverRate() { return turnoverRate; }
    public void setTurnoverRate(BigDecimal turnoverRate) { this.turnoverRate = turnoverRate; }

    public BigDecimal getReboundRate() { return reboundRate; }
    public void setReboundRate(BigDecimal reboundRate) { this.reboundRate = reboundRate; }
}