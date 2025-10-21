package com.nba.baskyapp.boxscore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoxScoreRepository extends JpaRepository<BoxScore, Long> {
    List<BoxScore> findByGameId(Long gameId);

    @Query(value = "SELECT bs.id, bs.game_id, bs.player_id, bs.team_id, bs.minutes_played, bs.points, bs.rebounds, bs.assists, bs.steals, bs.blocks, bs.turnovers, bs.field_goals_made, bs.field_goals_attempted, bs.three_pointers_made, bs.three_pointers_attempted, bs.free_throws_made, bs.free_throws_attempted, bs.plus_minus, bs.is_starter FROM box_scores bs WHERE bs.player_id = ?1 ORDER BY bs.game_id DESC LIMIT 10", nativeQuery = true)
    List<Object[]> findTop10ByPlayerIdOrderByGameIdDescRaw(Long playerId);
}
