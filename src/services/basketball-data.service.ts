import { Injectable } from '@angular/core';
import { Player } from '../components/player-card.component';
import { TeamStats } from '../components/team-overview.component';
import { RecentGame } from '../interfaces/recent-game.interface';

// Extended Player interface with all the insane stats
export interface ExtendedPlayer extends Player {
  // Shot Creation & Spacing
  contestedShotPercentage: number;
  uncontestedShotPercentage: number;
  catchAndShootPercentage: number;
  pullUpShotPercentage: number;
  shotsCreatedForOthers: number;
  gravityScore: number;
  offBallScreenAssists: number;
  hockeyAssists: number;
  
  // Clutch & Situational
  fourthQuarterPerformance: number;
  clutchTimeStats: number;
  gameWinningShotsMade: number;
  gameWinningShotsAttempted: number;
  vsTop10DefensesPerformance: number;
  backToBackGamePerformance: number;
  
  // Shot Selection & Efficiency
  shotQualityIndex: number;
  expectedFieldGoalPercentage: number;
  actualFieldGoalPercentage: number;
  rimFrequencyPercentage: number;
  midRangeFrequencyPercentage: number;
  corner3Percentage: number;
  aboveBreak3Percentage: number;
  fastBreakPointsPerGame: number;
  
  // Individual Defense
  opponentFieldGoalPercentageWhenGuarded: number;
  defensiveRatingByPosition: number;
  deflectionsPerGame: number;
  chargesDrawnPerGame: number;
  looseBallsRecoveredPerGame: number;
  defensiveReboundsVsOffensiveReboundsAllowed: number;
  
  // Team Defense Impact
  defensiveWinShares: number;
  opponentPointsPerPossession: number;
  defensiveBoxPlusMinus: number;
  rimProtectionPercentage: number;
  perimeterDefenseRating: number;
  helpDefenseRotations: number;
  
  // Hustle & Effort Stats
  contestedShotsPerGame: number;
  screenAssistsPerGame: number;
  milesTraveledPerGame: number;
  divingForLooseBalls: number;
  transitionDefenseStops: number;
  lateGameDefensiveStops: number;
  
  // Game Impact
  plusMinusInWins: number;
  plusMinusInLosses: number;
  performanceVsPlayoffTeams: number;
  homePerformance: number;
  roadPerformance: number;
  performanceByMonth: number;
  restPerformance: number;
  noRestPerformance: number;
  
  // Advanced Metrics
  realPlusMinus: number;
  defensiveEstimatedPlusMinus: number;
  offensivePointsAdded: number;
  defensivePointsAdded: number;
  winProbabilityAdded: number;
  clutchPerformanceRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class BasketballDataService {
  private players: ExtendedPlayer[] = [
    {
      id: 1,
      name: "LeBron James",
      team: "Los Angeles Lakers",
      position: "SF",
      gamesPlayed: 75,
      minutesPerGame: 35.5,
      points: 25.7,
      rebounds: 7.3,
      assists: 7.3,
      steals: 1.3,
      blocks: 0.5,
      fieldGoalPercentage: 0.503,
      threePointPercentage: 0.326,
      freeThrowPercentage: 0.756,
      trueShootingPercentage: 0.588,
      effectiveFieldGoalPercentage: 0.542,
      usageRate: 31.2,
      playerEfficiencyRating: 25.7,
      boxPlusMinus: 5.8,
      winShares: 9.4,
      valueOverReplacement: 3.7,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.487,
      uncontestedShotPercentage: 0.623,
      catchAndShootPercentage: 0.521,
      pullUpShotPercentage: 0.445,
      shotsCreatedForOthers: 3.2,
      gravityScore: 8.7,
      offBallScreenAssists: 2.1,
      hockeyAssists: 1.3,
      
      // Clutch & Situational
      fourthQuarterPerformance: 6.2,
      clutchTimeStats: 4.8,
      gameWinningShotsMade: 3,
      gameWinningShotsAttempted: 8,
      vsTop10DefensesPerformance: 23.1,
      backToBackGamePerformance: 0.92,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.12,
      expectedFieldGoalPercentage: 0.495,
      actualFieldGoalPercentage: 0.503,
      rimFrequencyPercentage: 0.34,
      midRangeFrequencyPercentage: 0.28,
      corner3Percentage: 0.389,
      aboveBreak3Percentage: 0.312,
      fastBreakPointsPerGame: 3.4,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.446,
      defensiveRatingByPosition: 108.2,
      deflectionsPerGame: 1.8,
      chargesDrawnPerGame: 0.4,
      looseBallsRecoveredPerGame: 1.2,
      defensiveReboundsVsOffensiveReboundsAllowed: 1.8,
      
      // Team Defense Impact
      defensiveWinShares: 2.1,
      opponentPointsPerPossession: 1.08,
      defensiveBoxPlusMinus: 1.2,
      rimProtectionPercentage: 0.62,
      perimeterDefenseRating: 109.4,
      helpDefenseRotations: 2.3,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 4.2,
      screenAssistsPerGame: 2.1,
      milesTraveledPerGame: 2.3,
      divingForLooseBalls: 0.8,
      transitionDefenseStops: 1.4,
      lateGameDefensiveStops: 1.1,
      
      // Game Impact
      plusMinusInWins: 8.4,
      plusMinusInLosses: -2.1,
      performanceVsPlayoffTeams: 24.1,
      homePerformance: 26.8,
      roadPerformance: 24.6,
      performanceByMonth: 1.08,
      restPerformance: 26.2,
      noRestPerformance: 24.8,
      
      // Advanced Metrics
      realPlusMinus: 4.2,
      defensiveEstimatedPlusMinus: 1.8,
      offensivePointsAdded: 5.2,
      defensivePointsAdded: 1.8,
      winProbabilityAdded: 0.18,
      clutchPerformanceRating: 8.7
    },
    {
      id: 2,
      name: "Stephen Curry",
      team: "Golden State Warriors",
      position: "PG",
      gamesPlayed: 74,
      minutesPerGame: 32.7,
      points: 26.4,
      rebounds: 4.5,
      assists: 5.1,
      steals: 0.9,
      blocks: 0.4,
      fieldGoalPercentage: 0.427,
      threePointPercentage: 0.408,
      freeThrowPercentage: 0.911,
      trueShootingPercentage: 0.599,
      effectiveFieldGoalPercentage: 0.562,
      usageRate: 33.0,
      playerEfficiencyRating: 24.0,
      boxPlusMinus: 4.2,
      winShares: 8.1,
      valueOverReplacement: 2.9,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.398,
      uncontestedShotPercentage: 0.567,
      catchAndShootPercentage: 0.445,
      pullUpShotPercentage: 0.421,
      shotsCreatedForOthers: 2.8,
      gravityScore: 9.8,
      offBallScreenAssists: 1.4,
      hockeyAssists: 0.9,
      
      // Clutch & Situational
      fourthQuarterPerformance: 7.1,
      clutchTimeStats: 5.4,
      gameWinningShotsMade: 5,
      gameWinningShotsAttempted: 12,
      vsTop10DefensesPerformance: 24.8,
      backToBackGamePerformance: 0.88,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.34,
      expectedFieldGoalPercentage: 0.445,
      actualFieldGoalPercentage: 0.427,
      rimFrequencyPercentage: 0.18,
      midRangeFrequencyPercentage: 0.22,
      corner3Percentage: 0.421,
      aboveBreak3Percentage: 0.398,
      fastBreakPointsPerGame: 4.2,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.478,
      defensiveRatingByPosition: 112.8,
      deflectionsPerGame: 1.1,
      chargesDrawnPerGame: 0.2,
      looseBallsRecoveredPerGame: 0.7,
      defensiveReboundsVsOffensiveReboundsAllowed: 0.9,
      
      // Team Defense Impact
      defensiveWinShares: 1.2,
      opponentPointsPerPossession: 1.12,
      defensiveBoxPlusMinus: -0.8,
      rimProtectionPercentage: 0.45,
      perimeterDefenseRating: 114.2,
      helpDefenseRotations: 1.8,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 2.8,
      screenAssistsPerGame: 1.4,
      milesTraveledPerGame: 2.8,
      divingForLooseBalls: 0.3,
      transitionDefenseStops: 0.8,
      lateGameDefensiveStops: 0.6,
      
      // Game Impact
      plusMinusInWins: 9.2,
      plusMinusInLosses: -1.8,
      performanceVsPlayoffTeams: 25.8,
      homePerformance: 27.1,
      roadPerformance: 25.7,
      performanceByMonth: 1.04,
      restPerformance: 27.2,
      noRestPerformance: 25.1,
      
      // Advanced Metrics
      realPlusMinus: 3.8,
      defensiveEstimatedPlusMinus: -0.4,
      offensivePointsAdded: 6.8,
      defensivePointsAdded: -0.2,
      winProbabilityAdded: 0.22,
      clutchPerformanceRating: 9.4
    },
    {
      id: 3,
      name: "Jayson Tatum",
      team: "Boston Celtics",
      position: "SF",
      gamesPlayed: 78,
      minutesPerGame: 36.9,
      points: 30.1,
      rebounds: 8.8,
      assists: 4.6,
      steals: 1.0,
      blocks: 0.7,
      fieldGoalPercentage: 0.466,
      threePointPercentage: 0.348,
      freeThrowPercentage: 0.853,
      trueShootingPercentage: 0.576,
      effectiveFieldGoalPercentage: 0.540,
      usageRate: 35.9,
      playerEfficiencyRating: 26.9,
      boxPlusMinus: 6.7,
      winShares: 11.8,
      valueOverReplacement: 5.0,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.441,
      uncontestedShotPercentage: 0.578,
      catchAndShootPercentage: 0.489,
      pullUpShotPercentage: 0.458,
      shotsCreatedForOthers: 2.9,
      gravityScore: 7.9,
      offBallScreenAssists: 1.8,
      hockeyAssists: 1.1,
      
      // Clutch & Situational
      fourthQuarterPerformance: 8.4,
      clutchTimeStats: 6.2,
      gameWinningShotsMade: 4,
      gameWinningShotsAttempted: 9,
      vsTop10DefensesPerformance: 27.8,
      backToBackGamePerformance: 0.94,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.08,
      expectedFieldGoalPercentage: 0.472,
      actualFieldGoalPercentage: 0.466,
      rimFrequencyPercentage: 0.28,
      midRangeFrequencyPercentage: 0.31,
      corner3Percentage: 0.378,
      aboveBreak3Percentage: 0.334,
      fastBreakPointsPerGame: 2.8,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.452,
      defensiveRatingByPosition: 106.8,
      deflectionsPerGame: 1.3,
      chargesDrawnPerGame: 0.3,
      looseBallsRecoveredPerGame: 0.9,
      defensiveReboundsVsOffensiveReboundsAllowed: 2.1,
      
      // Team Defense Impact
      defensiveWinShares: 3.2,
      opponentPointsPerPossession: 1.05,
      defensiveBoxPlusMinus: 2.1,
      rimProtectionPercentage: 0.58,
      perimeterDefenseRating: 107.2,
      helpDefenseRotations: 2.8,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 3.8,
      screenAssistsPerGame: 1.8,
      milesTraveledPerGame: 2.6,
      divingForLooseBalls: 0.5,
      transitionDefenseStops: 1.1,
      lateGameDefensiveStops: 1.4,
      
      // Game Impact
      plusMinusInWins: 11.2,
      plusMinusInLosses: -0.8,
      performanceVsPlayoffTeams: 28.7,
      homePerformance: 31.2,
      roadPerformance: 28.9,
      performanceByMonth: 1.12,
      restPerformance: 30.8,
      noRestPerformance: 29.1,
      
      // Advanced Metrics
      realPlusMinus: 5.1,
      defensiveEstimatedPlusMinus: 2.4,
      offensivePointsAdded: 7.8,
      defensivePointsAdded: 2.1,
      winProbabilityAdded: 0.24,
      clutchPerformanceRating: 8.9
    },
    {
      id: 4,
      name: "Jimmy Butler",
      team: "Miami Heat",
      position: "SF",
      gamesPlayed: 65,
      minutesPerGame: 33.0,
      points: 22.9,
      rebounds: 5.3,
      assists: 5.3,
      steals: 1.8,
      blocks: 0.4,
      fieldGoalPercentage: 0.535,
      threePointPercentage: 0.350,
      freeThrowPercentage: 0.852,
      trueShootingPercentage: 0.599,
      effectiveFieldGoalPercentage: 0.571,
      usageRate: 28.0,
      playerEfficiencyRating: 24.7,
      boxPlusMinus: 4.8,
      winShares: 7.6,
      valueOverReplacement: 2.8,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.521,
      uncontestedShotPercentage: 0.612,
      catchAndShootPercentage: 0.567,
      pullUpShotPercentage: 0.498,
      shotsCreatedForOthers: 3.1,
      gravityScore: 6.8,
      offBallScreenAssists: 2.3,
      hockeyAssists: 1.4,
      
      // Clutch & Situational
      fourthQuarterPerformance: 6.8,
      clutchTimeStats: 7.1,
      gameWinningShotsMade: 6,
      gameWinningShotsAttempted: 11,
      vsTop10DefensesPerformance: 23.8,
      backToBackGamePerformance: 1.08,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.18,
      expectedFieldGoalPercentage: 0.528,
      actualFieldGoalPercentage: 0.535,
      rimFrequencyPercentage: 0.42,
      midRangeFrequencyPercentage: 0.26,
      corner3Percentage: 0.389,
      aboveBreak3Percentage: 0.324,
      fastBreakPointsPerGame: 3.8,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.421,
      defensiveRatingByPosition: 105.2,
      deflectionsPerGame: 2.4,
      chargesDrawnPerGame: 0.8,
      looseBallsRecoveredPerGame: 1.6,
      defensiveReboundsVsOffensiveReboundsAllowed: 1.4,
      
      // Team Defense Impact
      defensiveWinShares: 2.8,
      opponentPointsPerPossession: 1.04,
      defensiveBoxPlusMinus: 2.8,
      rimProtectionPercentage: 0.68,
      perimeterDefenseRating: 104.8,
      helpDefenseRotations: 3.1,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 5.2,
      screenAssistsPerGame: 2.3,
      milesTraveledPerGame: 2.4,
      divingForLooseBalls: 1.2,
      transitionDefenseStops: 1.8,
      lateGameDefensiveStops: 1.6,
      
      // Game Impact
      plusMinusInWins: 7.8,
      plusMinusInLosses: 2.1,
      performanceVsPlayoffTeams: 24.3,
      homePerformance: 23.1,
      roadPerformance: 22.7,
      performanceByMonth: 0.97,
      restPerformance: 24.2,
      noRestPerformance: 21.8,
      
      // Advanced Metrics
      realPlusMinus: 3.9,
      defensiveEstimatedPlusMinus: 2.1,
      offensivePointsAdded: 4.8,
      defensivePointsAdded: 2.8,
      winProbabilityAdded: 0.31,
      clutchPerformanceRating: 9.2
    },
    {
      id: 5,
      name: "Giannis Antetokounmpo",
      team: "Milwaukee Bucks",
      position: "PF",
      gamesPlayed: 73,
      minutesPerGame: 35.2,
      points: 31.1,
      rebounds: 11.8,
      assists: 5.7,
      steals: 0.8,
      blocks: 1.2,
      fieldGoalPercentage: 0.553,
      threePointPercentage: 0.274,
      freeThrowPercentage: 0.645,
      trueShootingPercentage: 0.602,
      effectiveFieldGoalPercentage: 0.577,
      usageRate: 35.4,
      playerEfficiencyRating: 32.1,
      boxPlusMinus: 7.9,
      winShares: 12.7,
      valueOverReplacement: 6.2,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.567,
      uncontestedShotPercentage: 0.634,
      catchAndShootPercentage: 0.612,
      pullUpShotPercentage: 0.389,
      shotsCreatedForOthers: 2.1,
      gravityScore: 8.9,
      offBallScreenAssists: 3.2,
      hockeyAssists: 1.2,
      
      // Clutch & Situational
      fourthQuarterPerformance: 7.9,
      clutchTimeStats: 5.8,
      gameWinningShotsMade: 2,
      gameWinningShotsAttempted: 6,
      vsTop10DefensesPerformance: 28.8,
      backToBackGamePerformance: 0.91,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.28,
      expectedFieldGoalPercentage: 0.548,
      actualFieldGoalPercentage: 0.553,
      rimFrequencyPercentage: 0.58,
      midRangeFrequencyPercentage: 0.18,
      corner3Percentage: 0.298,
      aboveBreak3Percentage: 0.256,
      fastBreakPointsPerGame: 5.2,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.398,
      defensiveRatingByPosition: 102.8,
      deflectionsPerGame: 1.6,
      chargesDrawnPerGame: 0.6,
      looseBallsRecoveredPerGame: 1.4,
      defensiveReboundsVsOffensiveReboundsAllowed: 2.8,
      
      // Team Defense Impact
      defensiveWinShares: 4.2,
      opponentPointsPerPossession: 1.01,
      defensiveBoxPlusMinus: 3.8,
      rimProtectionPercentage: 0.78,
      perimeterDefenseRating: 103.2,
      helpDefenseRotations: 2.1,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 3.1,
      screenAssistsPerGame: 3.2,
      milesTraveledPerGame: 2.7,
      divingForLooseBalls: 0.9,
      transitionDefenseStops: 1.3,
      lateGameDefensiveStops: 1.8,
      
      // Game Impact
      plusMinusInWins: 12.8,
      plusMinusInLosses: 1.2,
      performanceVsPlayoffTeams: 29.4,
      homePerformance: 32.1,
      roadPerformance: 30.1,
      performanceByMonth: 1.14,
      restPerformance: 31.8,
      noRestPerformance: 30.2,
      
      // Advanced Metrics
      realPlusMinus: 6.8,
      defensiveEstimatedPlusMinus: 3.2,
      offensivePointsAdded: 8.9,
      defensivePointsAdded: 3.8,
      winProbabilityAdded: 0.28,
      clutchPerformanceRating: 8.1
    },
    {
      id: 6,
      name: "Kevin Durant",
      team: "Phoenix Suns",
      position: "PF",
      gamesPlayed: 47,
      minutesPerGame: 36.0,
      points: 27.1,
      rebounds: 6.7,
      assists: 5.0,
      steals: 0.9,
      blocks: 1.5,
      fieldGoalPercentage: 0.521,
      threePointPercentage: 0.413,
      freeThrowPercentage: 0.913,
      trueShootingPercentage: 0.670,
      effectiveFieldGoalPercentage: 0.610,
      usageRate: 30.8,
      playerEfficiencyRating: 31.4,
      boxPlusMinus: 6.8,
      winShares: 6.7,
      valueOverReplacement: 3.1,
      
      // Shot Creation & Spacing
      contestedShotPercentage: 0.498,
      uncontestedShotPercentage: 0.589,
      catchAndShootPercentage: 0.587,
      pullUpShotPercentage: 0.534,
      shotsCreatedForOthers: 2.4,
      gravityScore: 8.2,
      offBallScreenAssists: 1.6,
      hockeyAssists: 1.0,
      
      // Clutch & Situational
      fourthQuarterPerformance: 7.2,
      clutchTimeStats: 6.8,
      gameWinningShotsMade: 4,
      gameWinningShotsAttempted: 7,
      vsTop10DefensesPerformance: 25.8,
      backToBackGamePerformance: 0.86,
      
      // Shot Selection & Efficiency
      shotQualityIndex: 1.41,
      expectedFieldGoalPercentage: 0.515,
      actualFieldGoalPercentage: 0.521,
      rimFrequencyPercentage: 0.24,
      midRangeFrequencyPercentage: 0.38,
      corner3Percentage: 0.445,
      aboveBreak3Percentage: 0.398,
      fastBreakPointsPerGame: 2.1,
      
      // Individual Defense
      opponentFieldGoalPercentageWhenGuarded: 0.467,
      defensiveRatingByPosition: 109.8,
      deflectionsPerGame: 1.2,
      chargesDrawnPerGame: 0.1,
      looseBallsRecoveredPerGame: 0.8,
      defensiveReboundsVsOffensiveReboundsAllowed: 1.6,
      
      // Team Defense Impact
      defensiveWinShares: 1.8,
      opponentPointsPerPossession: 1.09,
      defensiveBoxPlusMinus: 0.8,
      rimProtectionPercentage: 0.72,
      perimeterDefenseRating: 110.4,
      helpDefenseRotations: 1.9,
      
      // Hustle & Effort Stats
      contestedShotsPerGame: 2.1,
      screenAssistsPerGame: 1.6,
      milesTraveledPerGame: 2.1,
      divingForLooseBalls: 0.4,
      transitionDefenseStops: 0.9,
      lateGameDefensiveStops: 1.2,
      
      // Game Impact
      plusMinusInWins: 8.9,
      plusMinusInLosses: 1.8,
      performanceVsPlayoffTeams: 26.8,
      homePerformance: 28.1,
      roadPerformance: 26.1,
      performanceByMonth: 1.02,
      restPerformance: 27.8,
      noRestPerformance: 26.2,
      
      // Advanced Metrics
      realPlusMinus: 5.4,
      defensiveEstimatedPlusMinus: 1.2,
      offensivePointsAdded: 7.2,
      defensivePointsAdded: 1.4,
      winProbabilityAdded: 0.26,
      clutchPerformanceRating: 9.1
    }
  ];

  private teamStats: TeamStats[] = [
    {
      name: "Boston Celtics",
      record: "57-25",
      wins: 57,
      losses: 25,
      winPercentage: 0.695,
      pointsPerGame: 120.6,
      pointsAgainst: 109.2,
      reboundsPerGame: 46.1,
      assistsPerGame: 26.9,
      fieldGoalPercentage: 0.473,
      threePointPercentage: 0.383,
      offensiveRating: 123.0,
      defensiveRating: 111.3,
      netRating: 11.7,
      pace: 98.1,
      effectiveFieldGoalPercentage: 0.582,
      turnoverRate: 0.123,
      reboundRate: 0.521
    },
    {
      name: "Milwaukee Bucks",
      record: "49-33",
      wins: 49,
      losses: 33,
      winPercentage: 0.598,
      pointsPerGame: 113.4,
      pointsAgainst: 112.7,
      reboundsPerGame: 47.9,
      assistsPerGame: 25.1,
      fieldGoalPercentage: 0.473,
      threePointPercentage: 0.387,
      offensiveRating: 115.8,
      defensiveRating: 115.0,
      netRating: 0.8,
      pace: 101.1,
      effectiveFieldGoalPercentage: 0.564,
      turnoverRate: 0.138,
      reboundRate: 0.511
    }
  ];

  getPlayers(): ExtendedPlayer[] {
    return [...this.players];
  }

  getTeamStats(): TeamStats[] {
    return [...this.teamStats];
  }

  searchPlayers(searchTerm: string): ExtendedPlayer[] {
    if (!searchTerm.trim()) {
      return this.getPlayers();
    }

    const term = searchTerm.toLowerCase();
    return this.players.filter(player => 
      player.name.toLowerCase().includes(term) ||
      player.team.toLowerCase().includes(term)
    );
  }

  filterPlayers(filters: { position?: string; team?: string }): ExtendedPlayer[] {
    let filteredPlayers = [...this.players];

    if (filters.position) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.position === filters.position
      );
    }

    if (filters.team) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.team === filters.team
      );
    }

    return filteredPlayers;
  }

  sortPlayers(players: ExtendedPlayer[], sortBy: string): ExtendedPlayer[] {
    return players.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'points':
          return b.points - a.points;
        case 'playerEfficiencyRating':
          return b.playerEfficiencyRating - a.playerEfficiencyRating;
        case 'trueShootingPercentage':
          return b.trueShootingPercentage - a.trueShootingPercentage;
        case 'winShares':
          return b.winShares - a.winShares;
        default:
          return 0;
      }
    });
  }

  getRecentGames(): RecentGame[] {
    return [
      {
        id: 1,
        homeTeam: 'Boston Celtics',
        awayTeam: 'Miami Heat',
        homeScore: 118,
        awayScore: 84,
        date: new Date('2024-01-15'),
        status: 'Final'
      },
      {
        id: 2,
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        homeScore: 145,
        awayScore: 144,
        date: new Date('2024-01-15'),
        status: 'Final OT'
      },
      {
        id: 3,
        homeTeam: 'Milwaukee Bucks',
        awayTeam: 'Phoenix Suns',
        homeScore: 140,
        awayScore: 129,
        date: new Date('2024-01-14'),
        status: 'Final'
      },
      {
        id: 4,
        homeTeam: 'Denver Nuggets',
        awayTeam: 'Dallas Mavericks',
        homeScore: 123,
        awayScore: 120,
        date: new Date('2024-01-14'),
        status: 'Final'
      },
      {
        id: 5,
        homeTeam: 'Philadelphia 76ers',
        awayTeam: 'New York Knicks',
        homeScore: 110,
        awayScore: 96,
        date: new Date('2024-01-13'),
        status: 'Final'
      }
    ];
  }
}