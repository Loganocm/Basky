package com.nba.baskyapp.game;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    // Find games by date
    List<Game> findByGameDate(LocalDate gameDate);

    // Find games by date range
    @Query("SELECT g FROM Game g WHERE g.gameDate BETWEEN :startDate AND :endDate ORDER BY g.gameDate DESC")
    List<Game> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find all games for a team (home or away)
    @Query("SELECT g FROM Game g WHERE g.homeTeam.id = :teamId OR g.awayTeam.id = :teamId ORDER BY g.gameDate DESC")
    List<Game> findByTeamId(@Param("teamId") Long teamId);

    // Find recent games (limit)
    @Query("SELECT g FROM Game g ORDER BY g.gameDate DESC")
    List<Game> findRecentGames();
}