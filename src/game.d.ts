import { Point } from "./geometry";

interface Pac {
  position: Point;
  id: number;
}

interface PelletDistance {
  pelletPoint: Point;
  pelletDistance: number;
}

interface PacOrder {
  id: number;
  destinationPoint: Point;
  distance: number;
  value: number;
  pelletDistanceList: PelletDistance[];
}
