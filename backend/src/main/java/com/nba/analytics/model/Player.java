package com.nba.analytics.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Player name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Team is required")
    @Column(nullable = false)
    private String team;

    @NotBlank(message = "Position is required")
    @Column(nullable = false)
    private String position;

    // Basic Stats
    @Min(value = 0, message = "Games played must be non-negative")
    @Column(name = "games_played")
    private Integer gamesPlayed;

    @DecimalMin(value = "0.0", message = "Minutes per game must be non-negative")
    @Column(name = "minutes_per_game", precision = 5, scale = 2)
    private BigDecimal minutesPerGame;

    @DecimalMin(value = "0.0", message = "Points must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal points;

    @DecimalMin(value = "0.0", message = "Rebounds must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal rebounds;

    @DecimalMin(value = "0.0", message = "Assists must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal assists;

    @DecimalMin(value = "0.0", message = "Steals must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal steals;

    @DecimalMin(value = "0.0", message = "Blocks must be non-negative")
    @Column(precision = 5, scale = 2)
    private BigDecimal blocks;

    // Shooting Percentages
    @DecimalMin(value = "0.0", message = "Field goal percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Field goal percentage cannot exceed 1.0")
    @Column(name = "field_goal_percentage", precision = 5, scale = 4)
    private BigDecimal fieldGoalPercentage;

    @DecimalMin(value = "0.0", message = "Three point percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Three point percentage cannot exceed 1.0")
    @Column(name = "three_point_percentage", precision = 5, scale = 4)
    private BigDecimal threePointPercentage;

    @DecimalMin(value = "0.0", message = "Free throw percentage must be non-negative")
    @DecimalMax(value = "1.0", message = "Free throw percentage cannot exceed 1.0")
    @Column(name = "free_throw_percentage", precision = 5, scale = 4)
    private BigDecimal freeThrowPercentage;

    // Advanced Stats
    @Column(name = "true_shooting_percentage", precision = 5, scale = 4)
    private BigDecimal trueShootingPercentage;

    @Column(name = "effective_field_goal_percentage", precision = 5, scale = 4)
    private BigDecimal effectiveFieldGoalPercentage;

    @Column(name = "usage_rate", precision = 5, scale = 2)
    private BigDecimal usageRate;

    @Column(name = "player_efficiency_rating", precision = 5, scale = 2)
    private BigDecimal playerEfficiencyRating;

    @Column(name = "box_plus_minus", precision = 6, scale = 2)
    private BigDecimal boxPlusMinus;

    @Column(name = "win_shares", precision = 5, scale = 2)
    private BigDecimal winShares;

    @Column(name = "value_over_replacement", precision = 5, scale = 2)
    private BigDecimal valueOverReplacement;

    // Shot Creation & Spacing
    @Column(name = "contested_shot_percentage", precision = 5, scale = 4)
    private BigDecimal contestedShotPercentage;

    @Column(name = "uncontested_shot_percentage", precision = 5, scale = 4)
    private BigDecimal uncontestedShotPercentage;

    @Column(name = "catch_and_shoot_percentage", precision = 5, scale = 4)
    private BigDecimal catchAndShootPercentage;

    @Column(name = "pull_up_shot_percentage", precision = 5, scale = 4)
    private BigDecimal pullUpShotPercentage;

    @Column(name = "shots_created_for_others", precision = 5, scale = 2)
    private BigDecimal shotsCreatedForOthers;

    @Column(name = "gravity_score", precision = 5, scale = 2)
    private BigDecimal gravityScore;

    @Column(name = "off_ball_screen_assists", precision = 5, scale = 2)
    private BigDecimal offBallScreenAssists;

    @Column(name = "hockey_assists", precision = 5, scale = 2)
    private BigDecimal hockeyAssists;

    // Clutch & Situational
    @Column(name = "fourth_quarter_performance", precision = 5, scale = 2)
    private BigDecimal fourthQuarterPerformance;

    @Column(name = "clutch_time_stats", precision = 5, scale = 2)
    private BigDecimal clutchTimeStats;

    @Column(name = "game_winning_shots_made")
    private Integer gameWinningShotsMade;

    @Column(name = "vs_top10_defenses_performance", precision = 5, scale = 2)
    private BigDecimal vsTop10DefensesPerformance;

    @Column(name = "back_to_back_game_performance", precision = 5, scale = 4)
    private BigDecimal backToBackGamePerformance;

    // Shot Selection & Efficiency
    @Column(name = "shot_quality_index", precision = 5, scale = 4)
    private BigDecimal shotQualityIndex;

    @Column(name = "rim_frequency_percentage", precision = 5, scale = 4)
    private BigDecimal rimFrequencyPercentage;

    @Column(name = "mid_range_frequency_percentage", precision = 5, scale = 4)
    private BigDecimal midRangeFrequencyPercentage;

    @Column(name = "corner3_percentage", precision = 5, scale = 4)
    private BigDecimal corner3Percentage;

    @Column(name = "fast_break_points_per_game", precision = 5, scale = 2)
    private BigDecimal fastBreakPointsPerGame;

    // Individual Defense
    @Column(name = "opponent_field_goal_percentage_when_guarded", precision = 5, scale = 4)
    private BigDecimal opponentFieldGoalPercentageWhenGuarded;

    @Column(name = "deflections_per_game", precision = 5, scale = 2)
    private BigDecimal deflectionsPerGame;

    @Column(name = "charges_drawn_per_game", precision = 5, scale = 2)
    private BigDecimal chargesDrawnPerGame;

    @Column(name = "loose_balls_recovered_per_game", precision = 5, scale = 2)
    private BigDecimal looseBallsRecoveredPerGame;

    // Team Defense Impact
    @Column(name = "defensive_win_shares", precision = 5, scale = 2)
    private BigDecimal defensiveWinShares;

    @Column(name = "rim_protection_percentage", precision = 5, scale = 4)
    private BigDecimal rimProtectionPercentage;

    @Column(name = "help_defense_rotations", precision = 5, scale = 2)
    private BigDecimal helpDefenseRotations;

    // Hustle & Effort Stats
    @Column(name = "contested_shots_per_game", precision = 5, scale = 2)
    private BigDecimal contestedShotsPerGame;

    @Column(name = "screen_assists_per_game", precision = 5, scale = 2)
    private BigDecimal screenAssistsPerGame;

    @Column(name = "miles_traveled_per_game", precision = 5, scale = 2)
    private BigDecimal milesTraveledPerGame;

    @Column(name = "diving_for_loose_balls", precision = 5, scale = 2)
    private BigDecimal divingForLooseBalls;

    @Column(name = "transition_defense_stops", precision = 5, scale = 2)
    private BigDecimal transitionDefenseStops;

    // Game Impact
    @Column(name = "plus_minus_in_wins", precision = 6, scale = 2)
    private BigDecimal plusMinusInWins;

    @Column(name = "performance_vs_playoff_teams", precision = 5, scale = 2)
    private BigDecimal performanceVsPlayoffTeams;

    @Column(name = "home_performance", precision = 5, scale = 2)
    private BigDecimal homePerformance;

    @Column(name = "road_performance", precision = 5, scale = 2)
    private BigDecimal roadPerformance;

    // Advanced Metrics
    @Column(name = "real_plus_minus", precision = 6, scale = 2)
    private BigDecimal realPlusMinus;

    @Column(name = "defensive_estimated_plus_minus", precision = 6, scale = 2)
    private BigDecimal defensiveEstimatedPlusMinus;

    @Column(name = "offensive_points_added", precision = 6, scale = 2)
    private BigDecimal offensivePointsAdded;

    @Column(name = "win_probability_added", precision = 5, scale = 4)
    private BigDecimal winProbabilityAdded;

    @Column(name = "clutch_performance_rating", precision = 5, scale = 2)
    private BigDecimal clutchPerformanceRating;

    // Constructors
    public Player() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Integer getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(Integer gamesPlayed) { this.gamesPlayed = gamesPlayed; }

    public BigDecimal getMinutesPerGame() { return minutesPerGame; }
    public void setMinutesPerGame(BigDecimal minutesPerGame) { this.minutesPerGame = minutesPerGame; }

    public BigDecimal getPoints() { return points; }
    public void setPoints(BigDecimal points) { this.points = points; }

    public BigDecimal getRebounds() { return rebounds; }
    public void setRebounds(BigDecimal rebounds) { this.rebounds = rebounds; }

    public BigDecimal getAssists() { return assists; }
    public void setAssists(BigDecimal assists) { this.assists = assists; }

    public BigDecimal getSteals() { return steals; }
    public void setSteals(BigDecimal steals) { this.steals = steals; }

    public BigDecimal getBlocks() { return blocks; }
    public void setBlocks(BigDecimal blocks) { this.blocks = blocks; }

    public BigDecimal getFieldGoalPercentage() { return fieldGoalPercentage; }
    public void setFieldGoalPercentage(BigDecimal fieldGoalPercentage) { this.fieldGoalPercentage = fieldGoalPercentage; }

    public BigDecimal getThreePointPercentage() { return threePointPercentage; }
    public void setThreePointPercentage(BigDecimal threePointPercentage) { this.threePointPercentage = threePointPercentage; }

    public BigDecimal getFreeThrowPercentage() { return freeThrowPercentage; }
    public void setFreeThrowPercentage(BigDecimal freeThrowPercentage) { this.freeThrowPercentage = freeThrowPercentage; }

    public BigDecimal getTrueShootingPercentage() { return trueShootingPercentage; }
    public void setTrueShootingPercentage(BigDecimal trueShootingPercentage) { this.trueShootingPercentage = trueShootingPercentage; }

    public BigDecimal getEffectiveFieldGoalPercentage() { return effectiveFieldGoalPercentage; }
    public void setEffectiveFieldGoalPercentage(BigDecimal effectiveFieldGoalPercentage) { this.effectiveFieldGoalPercentage = effectiveFieldGoalPercentage; }

    public BigDecimal getUsageRate() { return usageRate; }
    public void setUsageRate(BigDecimal usageRate) { this.usageRate = usageRate; }

    public BigDecimal getPlayerEfficiencyRating() { return playerEfficiencyRating; }
    public void setPlayerEfficiencyRating(BigDecimal playerEfficiencyRating) { this.playerEfficiencyRating = playerEfficiencyRating; }

    public BigDecimal getBoxPlusMinus() { return boxPlusMinus; }
    public void setBoxPlusMinus(BigDecimal boxPlusMinus) { this.boxPlusMinus = boxPlusMinus; }

    public BigDecimal getWinShares() { return winShares; }
    public void setWinShares(BigDecimal winShares) { this.winShares = winShares; }

    public BigDecimal getValueOverReplacement() { return valueOverReplacement; }
    public void setValueOverReplacement(BigDecimal valueOverReplacement) { this.valueOverReplacement = valueOverReplacement; }

    // Additional getters and setters for all other fields...
    public BigDecimal getContestedShotPercentage() { return contestedShotPercentage; }
    public void setContestedShotPercentage(BigDecimal contestedShotPercentage) { this.contestedShotPercentage = contestedShotPercentage; }

    public BigDecimal getUncontestedShotPercentage() { return uncontestedShotPercentage; }
    public void setUncontestedShotPercentage(BigDecimal uncontestedShotPercentage) { this.uncontestedShotPercentage = uncontestedShotPercentage; }

    public BigDecimal getCatchAndShootPercentage() { return catchAndShootPercentage; }
    public void setCatchAndShootPercentage(BigDecimal catchAndShootPercentage) { this.catchAndShootPercentage = catchAndShootPercentage; }

    public BigDecimal getPullUpShotPercentage() { return pullUpShotPercentage; }
    public void setPullUpShotPercentage(BigDecimal pullUpShotPercentage) { this.pullUpShotPercentage = pullUpShotPercentage; }

    public BigDecimal getShotsCreatedForOthers() { return shotsCreatedForOthers; }
    public void setShotsCreatedForOthers(BigDecimal shotsCreatedForOthers) { this.shotsCreatedForOthers = shotsCreatedForOthers; }

    public BigDecimal getGravityScore() { return gravityScore; }
    public void setGravityScore(BigDecimal gravityScore) { this.gravityScore = gravityScore; }

    public BigDecimal getOffBallScreenAssists() { return offBallScreenAssists; }
    public void setOffBallScreenAssists(BigDecimal offBallScreenAssists) { this.offBallScreenAssists = offBallScreenAssists; }

    public BigDecimal getHockeyAssists() { return hockeyAssists; }
    public void setHockeyAssists(BigDecimal hockeyAssists) { this.hockeyAssists = hockeyAssists; }

    public BigDecimal getFourthQuarterPerformance() { return fourthQuarterPerformance; }
    public void setFourthQuarterPerformance(BigDecimal fourthQuarterPerformance) { this.fourthQuarterPerformance = fourthQuarterPerformance; }

    public BigDecimal getClutchTimeStats() { return clutchTimeStats; }
    public void setClutchTimeStats(BigDecimal clutchTimeStats) { this.clutchTimeStats = clutchTimeStats; }

    public Integer getGameWinningShotsMade() { return gameWinningShotsMade; }
    public void setGameWinningShotsMade(Integer gameWinningShotsMade) { this.gameWinningShotsMade = gameWinningShotsMade; }

    public BigDecimal getVsTop10DefensesPerformance() { return vsTop10DefensesPerformance; }
    public void setVsTop10DefensesPerformance(BigDecimal vsTop10DefensesPerformance) { this.vsTop10DefensesPerformance = vsTop10DefensesPerformance; }

    public BigDecimal getBackToBackGamePerformance() { return backToBackGamePerformance; }
    public void setBackToBackGamePerformance(BigDecimal backToBackGamePerformance) { this.backToBackGamePerformance = backToBackGamePerformance; }

    public BigDecimal getShotQualityIndex() { return shotQualityIndex; }
    public void setShotQualityIndex(BigDecimal shotQualityIndex) { this.shotQualityIndex = shotQualityIndex; }

    public BigDecimal getRimFrequencyPercentage() { return rimFrequencyPercentage; }
    public void setRimFrequencyPercentage(BigDecimal rimFrequencyPercentage) { this.rimFrequencyPercentage = rimFrequencyPercentage; }

    public BigDecimal getMidRangeFrequencyPercentage() { return midRangeFrequencyPercentage; }
    public void setMidRangeFrequencyPercentage(BigDecimal midRangeFrequencyPercentage) { this.midRangeFrequencyPercentage = midRangeFrequencyPercentage; }

    public BigDecimal getCorner3Percentage() { return corner3Percentage; }
    public void setCorner3Percentage(BigDecimal corner3Percentage) { this.corner3Percentage = corner3Percentage; }

    public BigDecimal getFastBreakPointsPerGame() { return fastBreakPointsPerGame; }
    public void setFastBreakPointsPerGame(BigDecimal fastBreakPointsPerGame) { this.fastBreakPointsPerGame = fastBreakPointsPerGame; }

    public BigDecimal getOpponentFieldGoalPercentageWhenGuarded() { return opponentFieldGoalPercentageWhenGuarded; }
    public void setOpponentFieldGoalPercentageWhenGuarded(BigDecimal opponentFieldGoalPercentageWhenGuarded) { this.opponentFieldGoalPercentageWhenGuarded = opponentFieldGoalPercentageWhenGuarded; }

    public BigDecimal getDeflectionsPerGame() { return deflectionsPerGame; }
    public void setDeflectionsPerGame(BigDecimal deflectionsPerGame) { this.deflectionsPerGame = deflectionsPerGame; }

    public BigDecimal getChargesDrawnPerGame() { return chargesDrawnPerGame; }
    public void setChargesDrawnPerGame(BigDecimal chargesDrawnPerGame) { this.chargesDrawnPerGame = chargesDrawnPerGame; }

    public BigDecimal getLooseBallsRecoveredPerGame() { return looseBallsRecoveredPerGame; }
    public void setLooseBallsRecoveredPerGame(BigDecimal looseBallsRecoveredPerGame) { this.looseBallsRecoveredPerGame = looseBallsRecoveredPerGame; }

    public BigDecimal getDefensiveWinShares() { return defensiveWinShares; }
    public void setDefensiveWinShares(BigDecimal defensiveWinShares) { this.defensiveWinShares = defensiveWinShares; }

    public BigDecimal getRimProtectionPercentage() { return rimProtectionPercentage; }
    public void setRimProtectionPercentage(BigDecimal rimProtectionPercentage) { this.rimProtectionPercentage = rimProtectionPercentage; }

    public BigDecimal getHelpDefenseRotations() { return helpDefenseRotations; }
    public void setHelpDefenseRotations(BigDecimal helpDefenseRotations) { this.helpDefenseRotations = helpDefenseRotations; }

    public BigDecimal getContestedShotsPerGame() { return contestedShotsPerGame; }
    public void setContestedShotsPerGame(BigDecimal contestedShotsPerGame) { this.contestedShotsPerGame = contestedShotsPerGame; }

    public BigDecimal getScreenAssistsPerGame() { return screenAssistsPerGame; }
    public void setScreenAssistsPerGame(BigDecimal screenAssistsPerGame) { this.screenAssistsPerGame = screenAssistsPerGame; }

    public BigDecimal getMilesTraveledPerGame() { return milesTraveledPerGame; }
    public void setMilesTraveledPerGame(BigDecimal milesTraveledPerGame) { this.milesTraveledPerGame = milesTraveledPerGame; }

    public BigDecimal getDivingForLooseBalls() { return divingForLooseBalls; }
    public void setDivingForLooseBalls(BigDecimal divingForLooseBalls) { this.divingForLooseBalls = divingForLooseBalls; }

    public BigDecimal getTransitionDefenseStops() { return transitionDefenseStops; }
    public void setTransitionDefenseStops(BigDecimal transitionDefenseStops) { this.transitionDefenseStops = transitionDefenseStops; }

    public BigDecimal getPlusMinusInWins() { return plusMinusInWins; }
    public void setPlusMinusInWins(BigDecimal plusMinusInWins) { this.plusMinusInWins = plusMinusInWins; }

    public BigDecimal getPerformanceVsPlayoffTeams() { return performanceVsPlayoffTeams; }
    public void setPerformanceVsPlayoffTeams(BigDecimal performanceVsPlayoffTeams) { this.performanceVsPlayoffTeams = performanceVsPlayoffTeams; }

    public BigDecimal getHomePerformance() { return homePerformance; }
    public void setHomePerformance(BigDecimal homePerformance) { this.homePerformance = homePerformance; }

    public BigDecimal getRoadPerformance() { return roadPerformance; }
    public void setRoadPerformance(BigDecimal roadPerformance) { this.roadPerformance = roadPerformance; }

    public BigDecimal getRealPlusMinus() { return realPlusMinus; }
    public void setRealPlusMinus(BigDecimal realPlusMinus) { this.realPlusMinus = realPlusMinus; }

    public BigDecimal getDefensiveEstimatedPlusMinus() { return defensiveEstimatedPlusMinus; }
    public void setDefensiveEstimatedPlusMinus(BigDecimal defensiveEstimatedPlusMinus) { this.defensiveEstimatedPlusMinus = defensiveEstimatedPlusMinus; }

    public BigDecimal getOffensivePointsAdded() { return offensivePointsAdded; }
    public void setOffensivePointsAdded(BigDecimal offensivePointsAdded) { this.offensivePointsAdded = offensivePointsAdded; }

    public BigDecimal getWinProbabilityAdded() { return winProbabilityAdded; }
    public void setWinProbabilityAdded(BigDecimal winProbabilityAdded) { this.winProbabilityAdded = winProbabilityAdded; }

    public BigDecimal getClutchPerformanceRating() { return clutchPerformanceRating; }
    public void setClutchPerformanceRating(BigDecimal clutchPerformanceRating) { this.clutchPerformanceRating = clutchPerformanceRating; }
}