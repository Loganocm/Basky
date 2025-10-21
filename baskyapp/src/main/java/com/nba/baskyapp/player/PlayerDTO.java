package com.nba.baskyapp.player;

public class PlayerDTO {
    private Long id;
    private String name;
    private Long teamId;
    private String teamName;
    private String teamCity;
    private String teamAbbreviation;
    private String position;
    private Integer jerseyNumber;
    private String height;
    private Integer weight;
    private Integer age;
    private Integer gamesPlayed;
    private Double minutesPerGame;
    private Double points;
    private Double rebounds;
    private Double assists;
    private Double steals;
    private Double blocks;
    private Double turnovers;
    private Double fieldGoalPercentage;
    private Double threePointPercentage;
    private Double freeThrowPercentage;
    private Double offensiveRebounds;
    private Double defensiveRebounds;
    private Double fieldGoalsMade;
    private Double fieldGoalsAttempted;
    private Double threePointersMade;
    private Double threePointersAttempted;
    private Double freeThrowsMade;
    private Double freeThrowsAttempted;
    private Double plusMinus;
    private Double fantasyPoints;
    private Integer doubleDoubles;
    private Integer tripleDoubles;
    private Double personalFouls;
    private Double efficiencyRating;
    private Double trueShootingPercentage;
    private Double effectiveFieldGoalPercentage;
    private Double assistToTurnoverRatio;
    private Double impactScore;
    private Double usageRate;
    private Double playerEfficiencyRating;
    private Boolean isStarter;

    // Constructor from Player entity
    public PlayerDTO(Player player) {
        this.id = player.getId();
        this.name = player.getName();
        this.teamId = player.getTeam() != null ? player.getTeam().getId() : null;
        this.teamName = player.getTeam() != null ? player.getTeam().getName() : null;
        this.teamCity = player.getTeam() != null ? player.getTeam().getCity() : null;
        this.teamAbbreviation = player.getTeam() != null ? player.getTeam().getAbbreviation() : null;
        this.position = player.getPosition();
        this.jerseyNumber = player.getJerseyNumber();
        this.height = player.getHeight();
        this.weight = player.getWeight();
        this.age = player.getAge();
        this.gamesPlayed = player.getGamesPlayed();
        this.minutesPerGame = player.getMinutesPerGame();
        this.points = player.getPoints();
        this.rebounds = player.getRebounds();
        this.assists = player.getAssists();
        this.steals = player.getSteals();
        this.blocks = player.getBlocks();
        this.turnovers = player.getTurnovers();
        this.fieldGoalPercentage = player.getFieldGoalPercentage();
        this.threePointPercentage = player.getThreePointPercentage();
        this.freeThrowPercentage = player.getFreeThrowPercentage();
        this.offensiveRebounds = player.getOffensiveRebounds();
        this.defensiveRebounds = player.getDefensiveRebounds();
        this.fieldGoalsMade = player.getFieldGoalsMade();
        this.fieldGoalsAttempted = player.getFieldGoalsAttempted();
        this.threePointersMade = player.getThreePointersMade();
        this.threePointersAttempted = player.getThreePointersAttempted();
        this.freeThrowsMade = player.getFreeThrowsMade();
        this.freeThrowsAttempted = player.getFreeThrowsAttempted();
        this.plusMinus = player.getPlusMinus();
        this.fantasyPoints = player.getFantasyPoints();
        this.doubleDoubles = player.getDoubleDoubles();
        this.tripleDoubles = player.getTripleDoubles();
        this.personalFouls = player.getPersonalFouls();
        this.efficiencyRating = player.getEfficiencyRating();
        this.trueShootingPercentage = player.getTrueShootingPercentage();
        this.effectiveFieldGoalPercentage = player.getEffectiveFieldGoalPercentage();
        this.assistToTurnoverRatio = player.getAssistToTurnoverRatio();
        this.impactScore = player.getImpactScore();
        this.usageRate = player.getUsageRate();
        this.playerEfficiencyRating = player.getPlayerEfficiencyRating();
        this.isStarter = player.getIsStarter() != null ? player.getIsStarter() : false;
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

    public String getTeamCity() {
        return teamCity;
    }

    public void setTeamCity(String teamCity) {
        this.teamCity = teamCity;
    }

    public String getTeamAbbreviation() {
        return teamAbbreviation;
    }

    public void setTeamAbbreviation(String teamAbbreviation) {
        this.teamAbbreviation = teamAbbreviation;
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