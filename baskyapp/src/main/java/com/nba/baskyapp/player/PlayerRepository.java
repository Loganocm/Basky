package com.nba.baskyapp.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    // Find by team
    List<Player> findByTeamId(Long teamId);

    // Find starters by team
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId AND p.isStarter = true")
    List<Player> findStartersByTeamId(@Param("teamId") Long teamId);

    // Find reserves by team
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId AND (p.isStarter = false OR p.isStarter IS NULL)")
    List<Player> findReservesByTeamId(@Param("teamId") Long teamId);

    // Find by position
    List<Player> findByPosition(String position);

    // Find top scorers (ordered by PPG)
    @Query("SELECT p FROM Player p WHERE p.points IS NOT NULL ORDER BY p.points DESC")
    List<Player> findTopScorers();

    // Find by name (case insensitive search)
    @Query("SELECT p FROM Player p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Player> searchByName(@Param("name") String name);
}