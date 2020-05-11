import { Point } from "./geometry";

interface Pac {
  position: Point;
  id: number;
  abilityCooldown: number;
}

interface Pellet {
  position: Point;
  value: number;
}

interface GameState {
  visiblePellets: Pellet[];
  visiblePacs: Pac[];
  myScore: number;
  opponentScore: number;
}

interface GameConditions {
  map: string[][];
  width: number;
  height: number;
}
