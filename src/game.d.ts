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
interface PelletDistance {
  pelletPoint: Point;
  pelletDistance: number;
}

interface PacDestination {
  id: number;
  destinationPoint: Point;
  distance: number;
  value: number;
  pelletDistanceList: PelletDistance[];
}
