package com.nba.analytics.repository;

import com.nba.analytics.model.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    // Find team by name
    Optional<Team> findByName(String name);
    
    // Find teams by wins greater than
    List<Team> findByWinsGreaterThan(Integer wins);
    
    // Find teams by win percentage greater than
    @Query("SELECT t FROM Team t WHERE t.winPercentage > :winPercentage")
    List<Team> findByWinPercentageGreaterThan(@Param("winPercentage") Double winPercentage);
    
    // Get teams ordered by wins
    @Query("SELECT t FROM Team t ORDER BY t.wins DESC")
    List<Team> findAllOrderByWinsDesc();
    
    // Get teams ordered by net rating
    @Query("SELECT t FROM Team t ORDER BY t.netRating DESC")
    List<Team> findAllOrderByNetRatingDesc();
    
    // Get teams ordered by offensive rating
    @Query("SELECT t FROM Team t ORDER BY t.offensiveRating DESC")
    Page<Team> findTopByOffensiveRating(Pageable pageable);
    
    // Get teams ordered by defensive rating (ascending - lower is better)
    @Query("SELECT t FROM Team t ORDER BY t.defensiveRating ASC")
    Page<Team> findTopByDefensiveRating(Pageable pageable);
}