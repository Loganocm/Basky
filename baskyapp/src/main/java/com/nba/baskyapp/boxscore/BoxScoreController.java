package com.nba.baskyapp.boxscore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boxscores")
public class BoxScoreController {

    private static final Logger logger = LoggerFactory.getLogger(BoxScoreController.class);

    @Autowired
    private BoxScoreRepository boxScoreRepository;

    @GetMapping
    public ResponseEntity<List<BoxScoreDTO>> getAllBoxScores() {
        List<BoxScore> boxScores = boxScoreRepository.findAll();
        List<BoxScoreDTO> boxScoreDTOs = boxScores.stream()
                .map(BoxScoreDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(boxScoreDTOs);
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<BoxScoreDTO>> getBoxScoresByGame(@PathVariable Long gameId) {
        try {
            logger.info("=== GAME ENDPOINT START: gameId={} ===", gameId);
            List<BoxScore> boxScores = boxScoreRepository.findByGameId(gameId);
            logger.info("Found {} box scores from repository", boxScores.size());

            List<BoxScoreDTO> boxScoreDTOs = boxScores.stream()
                    .map(bs -> {
                        try {
                            logger.debug("Converting BoxScore ID: {}", bs.getId());
                            BoxScoreDTO dto = new BoxScoreDTO(bs);
                            dto.setGameId(gameId);
                            logger.debug("Successfully converted BoxScore ID: {}", bs.getId());
                            return dto;
                        } catch (Exception e) {
                            logger.error("Error converting BoxScore ID {}: {}", bs.getId(), e.getMessage(), e);
                            throw new RuntimeException("Failed to convert BoxScore " + bs.getId(), e);
                        }
                    })
                    .collect(Collectors.toList());
            logger.info("=== GAME ENDPOINT SUCCESS: Returning {} DTOs ===", boxScoreDTOs.size());
            return ResponseEntity.ok(boxScoreDTOs);
        } catch (Exception e) {
            logger.error("=== GAME ENDPOINT FAILED: {} ===", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<BoxScoreDTO>> getBoxScoresByPlayer(@PathVariable Long playerId) {
        try {
            logger.info("=== PLAYER ENDPOINT START: playerId={} ===", playerId);

            logger.info("Calling repository.findTop10ByPlayerIdOrderByGameIdDescRaw...");
            List<Object[]> rawResults = boxScoreRepository.findTop10ByPlayerIdOrderByGameIdDescRaw(playerId);
            logger.info("Repository returned {} raw results", rawResults.size());

            // Convert raw results to DTOs
            List<BoxScoreDTO> boxScoreDTOs = rawResults.stream()
                    .map(row -> {
                        BoxScoreDTO dto = new BoxScoreDTO();
                        dto.setId(((Number) row[0]).longValue());
                        dto.setGameId(((Number) row[1]).longValue()); // Now we have gameId!
                        dto.setPlayerId(((Number) row[2]).longValue());
                        dto.setTeamId(((Number) row[3]).longValue());
                        dto.setMinutesPlayed((String) row[4]);
                        dto.setPoints((Integer) row[5]);
                        dto.setRebounds((Integer) row[6]);
                        dto.setAssists((Integer) row[7]);
                        dto.setSteals((Integer) row[8]);
                        dto.setBlocks((Integer) row[9]);
                        dto.setTurnovers((Integer) row[10]);
                        dto.setFieldGoalsMade((Integer) row[11]);
                        dto.setFieldGoalsAttempted((Integer) row[12]);
                        dto.setThreePointersMade((Integer) row[13]);
                        dto.setThreePointersAttempted((Integer) row[14]);
                        dto.setFreeThrowsMade((Integer) row[15]);
                        dto.setFreeThrowsAttempted((Integer) row[16]);
                        dto.setPlusMinus((Integer) row[17]);
                        dto.setIsStarter((Boolean) row[18]);
                        // playerName and teamName will be null - frontend has them already
                        return dto;
                    })
                    .collect(Collectors.toList());
            logger.info("=== PLAYER ENDPOINT SUCCESS: Returning {} DTOs ===", boxScoreDTOs.size());
            return ResponseEntity.ok(boxScoreDTOs);
        } catch (Exception e) {
            logger.error("=== PLAYER ENDPOINT FAILED: {} ===", e.getMessage(), e);
            logger.error("Full stack trace:", e);
            throw e;
        }
    }
}
