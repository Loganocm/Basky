package com.nba.analytics.repository;

import com.nba.analytics.model.Player;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    
    // Find players by team
    List<Player> findByTeam(String team);
    
    // Find players by position
    List<Player> findByPosition(String position);
    
    // Find players by team and position
    List<Player> findByTeamAndPosition(String team, String position);
    
    // Search players by name (case insensitive)
    @Query("SELECT p FROM Player p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Player> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Search players by name or team
    @Query("SELECT p FROM Player p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.team) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Player> searchByNameOrTeam(@Param("searchTerm") String searchTerm);
    
    // Get top players by points
    @Query("SELECT p FROM Player p ORDER BY p.points DESC")
    Page<Player> findTopByPoints(Pageable pageable);
    
    // Get top players by player efficiency rating
    @Query("SELECT p FROM Player p ORDER BY p.playerEfficiencyRating DESC")
    Page<Player> findTopByPlayerEfficiencyRating(Pageable pageable);
    
    // Get top players by true shooting percentage
    @Query("SELECT p FROM Player p ORDER BY p.trueShootingPercentage DESC")
    Page<Player> findTopByTrueShootingPercentage(Pageable pageable);
    
    // Get top players by win shares
    @Query("SELECT p FROM Player p ORDER BY p.winShares DESC")
    Page<Player> findTopByWinShares(Pageable pageable);
    
    // Get top players by contested shot percentage
    @Query("SELECT p FROM Player p ORDER BY p.contestedShotPercentage DESC")
    Page<Player> findTopByContestedShotPercentage(Pageable pageable);
    
    // Get top players by clutch time stats
    @Query("SELECT p FROM Player p ORDER BY p.clutchTimeStats DESC")
    Page<Player> findTopByClutchTimeStats(Pageable pageable);
    
    // Get top players by deflections per game
    @Query("SELECT p FROM Player p ORDER BY p.deflectionsPerGame DESC")
    Page<Player> findTopByDeflectionsPerGame(Pageable pageable);
    
    // Get players with minimum games played
    @Query("SELECT p FROM Player p WHERE p.gamesPlayed >= :minGames")
    List<Player> findPlayersWithMinimumGames(@Param("minGames") Integer minGames);
    
    // Custom query for any stat field
    @Query("SELECT p FROM Player p ORDER BY " +
           "CASE :statField " +
           "WHEN 'points' THEN p.points " +
           "WHEN 'rebounds' THEN p.rebounds " +
           "WHEN 'assists' THEN p.assists " +
           "WHEN 'steals' THEN p.steals " +
           "WHEN 'blocks' THEN p.blocks " +
           "WHEN 'playerEfficiencyRating' THEN p.playerEfficiencyRating " +
           "WHEN 'trueShootingPercentage' THEN p.trueShootingPercentage " +
           "WHEN 'winShares' THEN p.winShares " +
           "WHEN 'contestedShotPercentage' THEN p.contestedShotPercentage " +
           "WHEN 'clutchTimeStats' THEN p.clutchTimeStats " +
           "WHEN 'deflectionsPerGame' THEN p.deflectionsPerGame " +
           "WHEN 'gravityScore' THEN p.gravityScore " +
           "WHEN 'rimProtectionPercentage' THEN p.rimProtectionPercentage " +
           "ELSE p.points END DESC")
    Page<Player> findTopPlayersByStat(@Param("statField") String statField, Pageable pageable);
}