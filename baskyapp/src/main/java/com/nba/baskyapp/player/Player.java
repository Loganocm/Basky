package com.nba.baskyapp.player;

import com.nba.baskyapp.team.Team;
import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Column(name = "height")
    private String height;

    @Column(name = "weight")
    private Integer weight;

    @Column(name = "age")
    private Integer age;

    // Season Stats
    @Column(name = "games_played")
    private Integer gamesPlayed;

    @Column(name = "minutes_per_game")
    private Double minutesPerGame;

    @Column(name = "points")
    private Double points;

    @Column(name = "rebounds")
    private Double rebounds;

    @Column(name = "assists")
    private Double assists;

    @Column(name = "steals")
    private Double steals;

    @Column(name = "blocks")
    private Double blocks;

    @Column(name = "turnovers")
    private Double turnovers;

    @Column(name = "field_goal_percentage")
    private Double fieldGoalPercentage;

    @Column(name = "three_point_percentage")
    private Double threePointPercentage;

    @Column(name = "free_throw_percentage")
    private Double freeThrowPercentage;

    // Additional shooting stats
    @Column(name = "offensive_rebounds")
    private Double offensiveRebounds;

    @Column(name = "defensive_rebounds")
    private Double defensiveRebounds;

    @Column(name = "field_goals_made")
    private Double fieldGoalsMade;

    @Column(name = "field_goals_attempted")
    private Double fieldGoalsAttempted;

    @Column(name = "three_pointers_made")
    private Double threePointersMade;

    @Column(name = "three_pointers_attempted")
    private Double threePointersAttempted;

    @Column(name = "free_throws_made")
    private Double freeThrowsMade;

    @Column(name = "free_throws_attempted")
    private Double freeThrowsAttempted;

    // Advanced stats
    @Column(name = "plus_minus")
    private Double plusMinus;

    @Column(name = "fantasy_points")
    private Double fantasyPoints;

    @Column(name = "double_doubles")
    private Integer doubleDoubles;

    @Column(name = "triple_doubles")
    private Integer tripleDoubles;

    @Column(name = "personal_fouls")
    private Double personalFouls;

    // Calculated advanced metrics
    @Column(name = "efficiency_rating")
    private Double efficiencyRating;

    @Column(name = "true_shooting_percentage")
    private Double trueShootingPercentage;

    @Column(name = "effective_field_goal_percentage")
    private Double effectiveFieldGoalPercentage;

    @Column(name = "assist_to_turnover_ratio")
    private Double assistToTurnoverRatio;

    @Column(name = "impact_score")
    private Double impactScore;

    @Column(name = "usage_rate")
    private Double usageRate;

    @Column(name = "player_efficiency_rating")
    private Double playerEfficiencyRating;

    @Column(name = "is_starter")
    private Boolean isStarter;

    // Constructors
    public Player() {
        this.isStarter = false; // Default value
    }

    public Player(String name) {
        this.name = name;
        this.isStarter = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getJerseyNumber() {
        return jerseyNumber;
    }

    public void setJerseyNumber(Integer jerseyNumber) {
        this.jerseyNumber = jerseyNumber;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getGamesPlayed() {
        return gamesPlayed;
    }

    public void setGamesPlayed(Integer gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }

    public Double getMinutesPerGame() {
        return minutesPerGame;
    }

    public void setMinutesPerGame(Double minutesPerGame) {
        this.minutesPerGame = minutesPerGame;
    }

    public Double getPoints() {
        return points;
    }

    public void setPoints(Double points) {
        this.points = points;
    }

    public Double getRebounds() {
        return rebounds;
    }

    public void setRebounds(Double rebounds) {
        this.rebounds = rebounds;
    }

    public Double getAssists() {
        return assists;
    }

    public void setAssists(Double assists) {
        this.assists = assists;
    }

    public Double getSteals() {
        return steals;
    }

    public void setSteals(Double steals) {
        this.steals = steals;
    }

    public Double getBlocks() {
        return blocks;
    }

    public void setBlocks(Double blocks) {
        this.blocks = blocks;
    }

    public Double getTurnovers() {
        return turnovers;
    }

    public void setTurnovers(Double turnovers) {
        this.turnovers = turnovers;
    }

    public Double getFieldGoalPercentage() {
        return fieldGoalPercentage;
    }

    public void setFieldGoalPercentage(Double fieldGoalPercentage) {
        this.fieldGoalPercentage = fieldGoalPercentage;
    }

    public Double getThreePointPercentage() {
        return threePointPercentage;
    }

    public void setThreePointPercentage(Double threePointPercentage) {
        this.threePointPercentage = threePointPercentage;
    }

    public Double getFreeThrowPercentage() {
        return freeThrowPercentage;
    }

    public void setFreeThrowPercentage(Double freeThrowPercentage) {
        this.freeThrowPercentage = freeThrowPercentage;
    }

    public Double getOffensiveRebounds() {
        return offensiveRebounds;
    }

    public void setOffensiveRebounds(Double offensiveRebounds) {
        this.offensiveRebounds = offensiveRebounds;
    }

    public Double getDefensiveRebounds() {
        return defensiveRebounds;
    }

    public void setDefensiveRebounds(Double defensiveRebounds) {
        this.defensiveRebounds = defensiveRebounds;
    }

    public Double getFieldGoalsMade() {
        return fieldGoalsMade;
    }

    public void setFieldGoalsMade(Double fieldGoalsMade) {
        this.fieldGoalsMade = fieldGoalsMade;
    }

    public Double getFieldGoalsAttempted() {
        return fieldGoalsAttempted;
    }

    public void setFieldGoalsAttempted(Double fieldGoalsAttempted) {
        this.fieldGoalsAttempted = fieldGoalsAttempted;
    }

    public Double getThreePointersMade() {
        return threePointersMade;
    }

    public void setThreePointersMade(Double threePointersMade) {
        this.threePointersMade = threePointersMade;
    }

    public Double getThreePointersAttempted() {
        return threePointersAttempted;
    }

    public void setThreePointersAttempted(Double threePointersAttempted) {
        this.threePointersAttempted = threePointersAttempted;
    }

    public Double getFreeThrowsMade() {
        return freeThrowsMade;
    }

    public void setFreeThrowsMade(Double freeThrowsMade) {
        this.freeThrowsMade = freeThrowsMade;
    }

    public Double getFreeThrowsAttempted() {
        return freeThrowsAttempted;
    }

    public void setFreeThrowsAttempted(Double freeThrowsAttempted) {
        this.freeThrowsAttempted = freeThrowsAttempted;
    }

    public Double getPlusMinus() {
        return plusMinus;
    }

    public void setPlusMinus(Double plusMinus) {
        this.plusMinus = plusMinus;
    }

    public Double getFantasyPoints() {
        return fantasyPoints;
    }

    public void setFantasyPoints(Double fantasyPoints) {
        this.fantasyPoints = fantasyPoints;
    }

    public Integer getDoubleDoubles() {
        return doubleDoubles;
    }

    public void setDoubleDoubles(Integer doubleDoubles) {
        this.doubleDoubles = doubleDoubles;
    }

    public Integer getTripleDoubles() {
        return tripleDoubles;
    }

    public void setTripleDoubles(Integer tripleDoubles) {
        this.tripleDoubles = tripleDoubles;
    }

    public Double getPersonalFouls() {
        return personalFouls;
    }

    public void setPersonalFouls(Double personalFouls) {
        this.personalFouls = personalFouls;
    }

    public Double getEfficiencyRating() {
        return efficiencyRating;
    }

    public void setEfficiencyRating(Double efficiencyRating) {
        this.efficiencyRating = efficiencyRating;
    }

    public Double getTrueShootingPercentage() {
        return trueShootingPercentage;
    }

    public void setTrueShootingPercentage(Double trueShootingPercentage) {
        this.trueShootingPercentage = trueShootingPercentage;
    }

    public Double getEffectiveFieldGoalPercentage() {
        return effectiveFieldGoalPercentage;
    }

    public void setEffectiveFieldGoalPercentage(Double effectiveFieldGoalPercentage) {
        this.effectiveFieldGoalPercentage = effectiveFieldGoalPercentage;
    }

    public Double getAssistToTurnoverRatio() {
        return assistToTurnoverRatio;
    }

    public void setAssistToTurnoverRatio(Double assistToTurnoverRatio) {
        this.assistToTurnoverRatio = assistToTurnoverRatio;
    }

    public Double getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(Double impactScore) {
        this.impactScore = impactScore;
    }

    public Double getUsageRate() {
        return usageRate;
    }

    public void setUsageRate(Double usageRate) {
        this.usageRate = usageRate;
    }

    public Double getPlayerEfficiencyRating() {
        return playerEfficiencyRating;
    }

    public void setPlayerEfficiencyRating(Double playerEfficiencyRating) {
        this.playerEfficiencyRating = playerEfficiencyRating;
    }

    public Boolean getIsStarter() {
        return isStarter;
    }

    public void setIsStarter(Boolean isStarter) {
        this.isStarter = isStarter;
    }
}