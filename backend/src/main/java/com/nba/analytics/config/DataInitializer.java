package com.nba.analytics.config;

import com.nba.analytics.model.Player;
import com.nba.analytics.model.Team;
import com.nba.analytics.repository.PlayerRepository;
import com.nba.analytics.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize teams
        initializeTeams();
        
        // Initialize players
        initializePlayers();
    }

    private void initializeTeams() {
        if (teamRepository.count() == 0) {
            Team celtics = new Team();
            celtics.setName("Boston Celtics");
            celtics.setRecord("57-25");
            celtics.setWins(57);
            celtics.setLosses(25);
            celtics.setWinPercentage(BigDecimal.valueOf(0.695));
            celtics.setPointsPerGame(BigDecimal.valueOf(120.6));
            celtics.setPointsAgainst(BigDecimal.valueOf(109.2));
            celtics.setReboundsPerGame(BigDecimal.valueOf(46.1));
            celtics.setAssistsPerGame(BigDecimal.valueOf(26.9));
            celtics.setFieldGoalPercentage(BigDecimal.valueOf(0.473));
            celtics.setThreePointPercentage(BigDecimal.valueOf(0.383));
            celtics.setOffensiveRating(BigDecimal.valueOf(123.0));
            celtics.setDefensiveRating(BigDecimal.valueOf(111.3));
            celtics.setNetRating(BigDecimal.valueOf(11.7));
            celtics.setPace(BigDecimal.valueOf(98.1));
            celtics.setEffectiveFieldGoalPercentage(BigDecimal.valueOf(0.582));
            celtics.setTurnoverRate(BigDecimal.valueOf(0.123));
            celtics.setReboundRate(BigDecimal.valueOf(0.521));
            teamRepository.save(celtics);

            Team bucks = new Team();
            bucks.setName("Milwaukee Bucks");
            bucks.setRecord("49-33");
            bucks.setWins(49);
            bucks.setLosses(33);
            bucks.setWinPercentage(BigDecimal.valueOf(0.598));
            bucks.setPointsPerGame(BigDecimal.valueOf(113.4));
            bucks.setPointsAgainst(BigDecimal.valueOf(112.7));
            bucks.setReboundsPerGame(BigDecimal.valueOf(47.9));
            bucks.setAssistsPerGame(BigDecimal.valueOf(25.1));
            bucks.setFieldGoalPercentage(BigDecimal.valueOf(0.473));
            bucks.setThreePointPercentage(BigDecimal.valueOf(0.387));
            bucks.setOffensiveRating(BigDecimal.valueOf(115.8));
            bucks.setDefensiveRating(BigDecimal.valueOf(115.0));
            bucks.setNetRating(BigDecimal.valueOf(0.8));
            bucks.setPace(BigDecimal.valueOf(101.1));
            bucks.setEffectiveFieldGoalPercentage(BigDecimal.valueOf(0.564));
            bucks.setTurnoverRate(BigDecimal.valueOf(0.138));
            bucks.setReboundRate(BigDecimal.valueOf(0.511));
            teamRepository.save(bucks);
        }
    }

    private void initializePlayers() {
        if (playerRepository.count() == 0) {
            // LeBron James
            Player lebron = new Player();
            lebron.setName("LeBron James");
            lebron.setTeam("Los Angeles Lakers");
            lebron.setPosition("SF");
            lebron.setGamesPlayed(75);
            lebron.setMinutesPerGame(BigDecimal.valueOf(35.5));
            lebron.setPoints(BigDecimal.valueOf(25.7));
            lebron.setRebounds(BigDecimal.valueOf(7.3));
            lebron.setAssists(BigDecimal.valueOf(7.3));
            lebron.setSteals(BigDecimal.valueOf(1.3));
            lebron.setBlocks(BigDecimal.valueOf(0.5));
            lebron.setFieldGoalPercentage(BigDecimal.valueOf(0.503));
            lebron.setThreePointPercentage(BigDecimal.valueOf(0.326));
            lebron.setFreeThrowPercentage(BigDecimal.valueOf(0.756));
            lebron.setTrueShootingPercentage(BigDecimal.valueOf(0.588));
            lebron.setEffectiveFieldGoalPercentage(BigDecimal.valueOf(0.542));
            lebron.setUsageRate(BigDecimal.valueOf(31.2));
            lebron.setPlayerEfficiencyRating(BigDecimal.valueOf(25.7));
            lebron.setBoxPlusMinus(BigDecimal.valueOf(5.8));
            lebron.setWinShares(BigDecimal.valueOf(9.4));
            lebron.setValueOverReplacement(BigDecimal.valueOf(3.7));
            
            // Advanced stats
            lebron.setContestedShotPercentage(BigDecimal.valueOf(0.487));
            lebron.setUncontestedShotPercentage(BigDecimal.valueOf(0.623));
            lebron.setCatchAndShootPercentage(BigDecimal.valueOf(0.521));
            lebron.setPullUpShotPercentage(BigDecimal.valueOf(0.445));
            lebron.setShotsCreatedForOthers(BigDecimal.valueOf(3.2));
            lebron.setGravityScore(BigDecimal.valueOf(8.7));
            lebron.setOffBallScreenAssists(BigDecimal.valueOf(2.1));
            lebron.setHockeyAssists(BigDecimal.valueOf(1.3));
            lebron.setFourthQuarterPerformance(BigDecimal.valueOf(6.2));
            lebron.setClutchTimeStats(BigDecimal.valueOf(4.8));
            lebron.setGameWinningShotsMade(3);
            lebron.setVsTop10DefensesPerformance(BigDecimal.valueOf(23.1));
            lebron.setBackToBackGamePerformance(BigDecimal.valueOf(0.92));
            lebron.setShotQualityIndex(BigDecimal.valueOf(1.12));
            lebron.setRimFrequencyPercentage(BigDecimal.valueOf(0.34));
            lebron.setMidRangeFrequencyPercentage(BigDecimal.valueOf(0.28));
            lebron.setCorner3Percentage(BigDecimal.valueOf(0.389));
            lebron.setFastBreakPointsPerGame(BigDecimal.valueOf(3.4));
            lebron.setOpponentFieldGoalPercentageWhenGuarded(BigDecimal.valueOf(0.446));
            lebron.setDeflectionsPerGame(BigDecimal.valueOf(1.8));
            lebron.setChargesDrawnPerGame(BigDecimal.valueOf(0.4));
            lebron.setLooseBallsRecoveredPerGame(BigDecimal.valueOf(1.2));
            lebron.setDefensiveWinShares(BigDecimal.valueOf(2.1));
            lebron.setRimProtectionPercentage(BigDecimal.valueOf(0.62));
            lebron.setHelpDefenseRotations(BigDecimal.valueOf(2.3));
            lebron.setContestedShotsPerGame(BigDecimal.valueOf(4.2));
            lebron.setScreenAssistsPerGame(BigDecimal.valueOf(2.1));
            lebron.setMilesTraveledPerGame(BigDecimal.valueOf(2.3));
            lebron.setDivingForLooseBalls(BigDecimal.valueOf(0.8));
            lebron.setTransitionDefenseStops(BigDecimal.valueOf(1.4));
            lebron.setPlusMinusInWins(BigDecimal.valueOf(8.4));
            lebron.setPerformanceVsPlayoffTeams(BigDecimal.valueOf(24.1));
            lebron.setHomePerformance(BigDecimal.valueOf(26.8));
            lebron.setRoadPerformance(BigDecimal.valueOf(24.6));
            lebron.setRealPlusMinus(BigDecimal.valueOf(4.2));
            lebron.setDefensiveEstimatedPlusMinus(BigDecimal.valueOf(1.8));
            lebron.setOffensivePointsAdded(BigDecimal.valueOf(5.2));
            lebron.setWinProbabilityAdded(BigDecimal.valueOf(0.18));
            lebron.setClutchPerformanceRating(BigDecimal.valueOf(8.7));
            playerRepository.save(lebron);

            // Stephen Curry
            Player curry = new Player();
            curry.setName("Stephen Curry");
            curry.setTeam("Golden State Warriors");
            curry.setPosition("PG");
            curry.setGamesPlayed(74);
            curry.setMinutesPerGame(BigDecimal.valueOf(32.7));
            curry.setPoints(BigDecimal.valueOf(26.4));
            curry.setRebounds(BigDecimal.valueOf(4.5));
            curry.setAssists(BigDecimal.valueOf(5.1));
            curry.setSteals(BigDecimal.valueOf(0.9));
            curry.setBlocks(BigDecimal.valueOf(0.4));
            curry.setFieldGoalPercentage(BigDecimal.valueOf(0.427));
            curry.setThreePointPercentage(BigDecimal.valueOf(0.408));
            curry.setFreeThrowPercentage(BigDecimal.valueOf(0.911));
            curry.setTrueShootingPercentage(BigDecimal.valueOf(0.599));
            curry.setEffectiveFieldGoalPercentage(BigDecimal.valueOf(0.562));
            curry.setUsageRate(BigDecimal.valueOf(33.0));
            curry.setPlayerEfficiencyRating(BigDecimal.valueOf(24.0));
            curry.setBoxPlusMinus(BigDecimal.valueOf(4.2));
            curry.setWinShares(BigDecimal.valueOf(8.1));
            curry.setValueOverReplacement(BigDecimal.valueOf(2.9));
            
            // Advanced stats
            curry.setContestedShotPercentage(BigDecimal.valueOf(0.398));
            curry.setUncontestedShotPercentage(BigDecimal.valueOf(0.567));
            curry.setCatchAndShootPercentage(BigDecimal.valueOf(0.445));
            curry.setPullUpShotPercentage(BigDecimal.valueOf(0.421));
            curry.setShotsCreatedForOthers(BigDecimal.valueOf(2.8));
            curry.setGravityScore(BigDecimal.valueOf(9.8));
            curry.setOffBallScreenAssists(BigDecimal.valueOf(1.4));
            curry.setHockeyAssists(BigDecimal.valueOf(0.9));
            curry.setFourthQuarterPerformance(BigDecimal.valueOf(7.1));
            curry.setClutchTimeStats(BigDecimal.valueOf(5.4));
            curry.setGameWinningShotsMade(5);
            curry.setVsTop10DefensesPerformance(BigDecimal.valueOf(24.8));
            curry.setBackToBackGamePerformance(BigDecimal.valueOf(0.88));
            curry.setShotQualityIndex(BigDecimal.valueOf(1.34));
            curry.setRimFrequencyPercentage(BigDecimal.valueOf(0.18));
            curry.setMidRangeFrequencyPercentage(BigDecimal.valueOf(0.22));
            curry.setCorner3Percentage(BigDecimal.valueOf(0.421));
            curry.setFastBreakPointsPerGame(BigDecimal.valueOf(4.2));
            curry.setOpponentFieldGoalPercentageWhenGuarded(BigDecimal.valueOf(0.478));
            curry.setDeflectionsPerGame(BigDecimal.valueOf(1.1));
            curry.setChargesDrawnPerGame(BigDecimal.valueOf(0.2));
            curry.setLooseBallsRecoveredPerGame(BigDecimal.valueOf(0.7));
            curry.setDefensiveWinShares(BigDecimal.valueOf(1.2));
            curry.setRimProtectionPercentage(BigDecimal.valueOf(0.45));
            curry.setHelpDefenseRotations(BigDecimal.valueOf(1.8));
            curry.setContestedShotsPerGame(BigDecimal.valueOf(2.8));
            curry.setScreenAssistsPerGame(BigDecimal.valueOf(1.4));
            curry.setMilesTraveledPerGame(BigDecimal.valueOf(2.8));
            curry.setDivingForLooseBalls(BigDecimal.valueOf(0.3));
            curry.setTransitionDefenseStops(BigDecimal.valueOf(0.8));
            curry.setPlusMinusInWins(BigDecimal.valueOf(9.2));
            curry.setPerformanceVsPlayoffTeams(BigDecimal.valueOf(25.8));
            curry.setHomePerformance(BigDecimal.valueOf(27.1));
            curry.setRoadPerformance(BigDecimal.valueOf(25.7));
            curry.setRealPlusMinus(BigDecimal.valueOf(3.8));
            curry.setDefensiveEstimatedPlusMinus(BigDecimal.valueOf(-0.4));
            curry.setOffensivePointsAdded(BigDecimal.valueOf(6.8));
            curry.setWinProbabilityAdded(BigDecimal.valueOf(0.22));
            curry.setClutchPerformanceRating(BigDecimal.valueOf(9.4));
            playerRepository.save(curry);
        }
    }
}