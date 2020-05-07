export interface Point {
  x: number;
  y: number;
}

export function manhattanDistance(pointA: Point, pointB: Point): number {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

export function areEqual(pointA: Point, pointB: Point): boolean {
  return pointA.x === pointB.x && pointA.y === pointB.y;
}
