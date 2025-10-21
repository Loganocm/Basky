package com.nba.baskyapp.team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByNameContainingIgnoreCase(String name);
    List<Team> findByAbbreviationIgnoreCase(String abbreviation);
}