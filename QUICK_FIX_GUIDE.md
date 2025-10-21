# Quick Fix Guide for Frontend Compilation Errors

## Errors Summary

Your Angular app has compilation errors because several components still reference the old `ExtendedPlayer` interface and mock data patterns.

## Global Find & Replace Needed

### 1. Import Statements (All Component Files)

**FIND:**

```typescript
import { Player } from "./player-card.component";
import {
  BasketballDataService,
  ExtendedPlayer,
} from "../services/basketball-data.service";
```

**REPLACE WITH:**

```typescript
import {
  BasketballDataService,
  Player,
} from "../services/basketball-data.service";
```

### 2. Type References

**FIND:**

```typescript
ExtendedPlayer;
```

**REPLACE WITH:**

```typescript
Player;
```

### 3. Method Calls - getAllPlayers()

**FIND:**

```typescript
const players = this.basketballService.getPlayers();
```

**REPLACE WITH:**

```typescript
this.basketballService.getAllPlayers().subscribe((players) => {
  // Your code here - move it inside the subscribe block
});
```

OR if you need immediate access:

```typescript
ngOnInit() {
  this.basketballService.getAllPlayers().subscribe(players => {
    this.players = players;
    // Rest of your initialization
  });
}
```

## Files That Need Fixing

### 1. `category-leaderboards.component.ts`

- Change `ExtendedPlayer` → `Player`
- Wrap `getPlayers()` in `.subscribe()`
- Remove references to fake stats like:
  - `contestedShotPercentage`
  - `clutchTimeStats`
  - `gravityScore`
  - `defensiveWinShares`
  - etc.

**Replacement Stats (Real ones from your DB):**

- Use `fieldGoalPercentage`, `threePointPercentage`, `freeThrowPercentage`
- Use `efficiencyRating`, `impactScore`, `playerEfficiencyRating`
- Use `steals`, `blocks`, `defensiveRebounds`
- Use `doubleDoubles`, `tripleDoubles`, `fantasyPoints`

### 2. `category-stats.component.ts`

**CHANGE:**

```typescript
import { Player } from "./player-card.component";
```

**TO:**

```typescript
import { Player } from "../services/basketball-data.service";
```

### 3. `player-page.component.ts`

**CHANGE:**

```typescript
import {
  BasketballDataService,
  ExtendedPlayer,
} from "../services/basketball-data.service";
// ...
const players = this.basketballService.getPlayers();
this.player = players.find((p) => p.name === this.playerName) || null;
```

**TO:**

```typescript
import { BasketballDataService, Player } from '../services/basketball-data.service';
// ...
player: Player | null = null;

ngOnInit() {
  const playerName = this.route.snapshot.params['name'];
  this.basketballService.getAllPlayers().subscribe(players => {
    this.player = players.find(p => p.name === playerName) || null;
  });
}
```

### 4. `stat-detail.component.ts`

**SAME FIX AS ABOVE:**

- Change `ExtendedPlayer` → `Player`
- Change `getPlayers()` → `getAllPlayers().subscribe(...)`

### 5. `stats-matrix.component.ts`

**CHANGE:**

```typescript
import { Player } from "./player-card.component";
```

**TO:**

```typescript
import { Player } from "../services/basketball-data.service";
```

### 6. `team-page.component.ts`

**CHANGE:**

```typescript
import {
  BasketballDataService,
  ExtendedPlayer,
} from "../services/basketball-data.service";
// ...
const allPlayers = this.basketballService.getPlayers();
const teamPlayers = allPlayers.filter((p) => p.team === this.team.abbreviation);
```

**TO:**

```typescript
import { BasketballDataService, Player } from '../services/basketball-data.service';
// ...
players: Player[] = [];

ngOnInit() {
  this.basketballService.getAllPlayers().subscribe(allPlayers => {
    this.players = allPlayers.filter(p => p.teamAbbreviation === this.teamAbbr);
  });
}
```

**NOTE:** `team` property is now `teamAbbreviation` in the new Player interface!

### 7. `main.ts`

**CHANGE:**

```typescript
import {
  BasketballDataService,
  ExtendedPlayer,
} from "./services/basketball-data.service";
```

**TO:**

```typescript
import {
  BasketballDataService,
  Player,
} from "./services/basketball-data.service";
```

## Key Changes to Remember

1. **`Player` is now the only interface** - no more `ExtendedPlayer`
2. **Player interface is exported from `basketball-data.service.ts`**, not from `player-card.component.ts`
3. **All service methods return `Observable<Player[]>`** - must use `.subscribe()`
4. **Team property changed** from `team` to `teamAbbreviation` (or use `teamName`)
5. **Many fantasy stats don't exist** - stick to the 41 real fields

## Player Interface Fields (Reference)

Available fields (all real data from your database):

```typescript
// Basic
id, name, position, teamId, teamName, teamCity, teamAbbreviation;

// Per-game stats
gamesPlayed,
  minutesPerGame,
  points,
  rebounds,
  assists,
  steals,
  blocks,
  turnovers,
  fieldGoalPercentage,
  threePointPercentage,
  freeThrowPercentage;

// Shooting details
offensiveRebounds,
  defensiveRebounds,
  fieldGoalsMade,
  fieldGoalsAttempted,
  threePointersMade,
  threePointersAttempted,
  freeThrowsMade,
  freeThrowsAttempted;

// Advanced
plusMinus, fantasyPoints, doubleDoubles, tripleDoubles, personalFouls;

// Player info
age, height, weight;

// Calculated metrics
efficiencyRating,
  trueShootingPercentage,
  effectiveFieldGoalPercentage,
  assistToTurnoverRatio,
  impactScore,
  usageRate,
  playerEfficiencyRating;
```

## Testing After Fixes

Run `npm start` and verify:

1. No TypeScript errors
2. App compiles successfully
3. Make sure backend is running on port 8080
4. Check browser console for runtime errors

## If You Get Stuck

The most common pattern that needs changing:

**OLD WAY:**

```typescript
const data = this.service.getPlayers(); // Synchronous
this.players = data.filter(...);
```

**NEW WAY:**

```typescript
this.service.getAllPlayers().subscribe(data => {  // Async
  this.players = data.filter(...);
});
```
