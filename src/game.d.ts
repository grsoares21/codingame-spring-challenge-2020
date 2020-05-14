import { Point } from "./geometry";

type PacType = "SCISSORS" | "PAPER" | "ROCK";

interface Pac {
  position: Point;
  id: number;
  abilityCooldown: number;
  speedTurnsLeft: number;
  type: PacType;
}

interface Pellet {
  position: Point;
  value: number;
}

interface GameState {
  visiblePellets: Pellet[];
  myPacs: Pac[];
  enemyPacs: Pac[];
  myScore: number;
  opponentScore: number;
}

interface GameConditions {
  map: string[][];
  width: number;
  height: number;
}
