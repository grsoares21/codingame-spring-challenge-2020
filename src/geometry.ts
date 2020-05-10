import { random } from "./random";
import { PriorityQueue } from "./queues";
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

export function findRandomAvailablePosition(map: string[][]): Point {
  while (true) {
    let y = Math.floor(random() * map.length);
    let x = Math.floor(random() * map[0].length);

    if (map[y][x] === " ") {
      return { x, y };
    }
  }
}

export function findPath(
  map: string[][],
  pacPoints: Point[],
  srcPoint: Point,
  dstPoint: Point
): Point[] {
  type VisitingPoint = {
    point: Point;
    visited: boolean;
    distanceToSrc: number;
    throughPoint: VisitingPoint;
  };
  const pointsQueue = new PriorityQueue<VisitingPoint>({
    comparator: function (pointA, pointB) {
      const pointATotalDistance =
        pointA.distanceToSrc + manhattanDistance(dstPoint, pointA.point);
      const pointBTotalDistance =
        pointB.distanceToSrc + manhattanDistance(dstPoint, pointB.point);
      return pointATotalDistance - pointBTotalDistance;
    },
  });

  let visitedPointsMatrix: VisitingPoint[][] = [];

  for (let y = 0; y < map.length; y++) {
    visitedPointsMatrix[y] = [];
    for (let x = 0; x < map[y].length; x++) {
      visitedPointsMatrix[y][x] =
        map[y][x] === "#"
          ? null
          : {
              point: { x, y },
              visited: false,
              distanceToSrc: Number.POSITIVE_INFINITY,
              throughPoint: null,
            };
    }
  }

  pacPoints.forEach(({ x, y }) => {
    visitedPointsMatrix[y][x] = null;
  });

  visitedPointsMatrix[srcPoint.y][srcPoint.x].distanceToSrc = 0;
  pointsQueue.queue(visitedPointsMatrix[srcPoint.y][srcPoint.x]);

  while (pointsQueue.length > 0) {
    const currentPointToVisit = pointsQueue.dequeue();
    currentPointToVisit.visited = true;

    if (areEqual(currentPointToVisit.point, dstPoint)) {
      let path: VisitingPoint[] = [currentPointToVisit];
      let currentPathPoint = currentPointToVisit;
      while (currentPathPoint.throughPoint) {
        path = [currentPathPoint.throughPoint, ...path];
        currentPathPoint = currentPathPoint.throughPoint;
      }

      return path.map((visitingPoint) => visitingPoint.point);
    }

    const northPoint =
      visitedPointsMatrix[currentPointToVisit.point.y - 1] &&
      visitedPointsMatrix[currentPointToVisit.point.y - 1][
        currentPointToVisit.point.x
      ];
    const southPoint =
      visitedPointsMatrix[currentPointToVisit.point.y + 1] &&
      visitedPointsMatrix[currentPointToVisit.point.y + 1][
        currentPointToVisit.point.x
      ];
    const eastPoint =
      visitedPointsMatrix[currentPointToVisit.point.y][
        currentPointToVisit.point.x + 1
      ];
    const westPoint =
      visitedPointsMatrix[currentPointToVisit.point.y][
        currentPointToVisit.point.x - 1
      ];
    if (northPoint) {
      if (northPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        northPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        northPoint.throughPoint = currentPointToVisit;
      }
      if (!northPoint.visited) {
        pointsQueue.queue(northPoint);
      }
    }
    if (southPoint) {
      if (southPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        southPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        southPoint.throughPoint = currentPointToVisit;
      }
      if (!southPoint.visited) {
        pointsQueue.queue(southPoint);
      }
    }
    if (eastPoint) {
      if (eastPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        eastPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        eastPoint.throughPoint = currentPointToVisit;
      }
      if (!eastPoint.visited) {
        pointsQueue.queue(eastPoint);
      }
    }
    if (westPoint) {
      if (westPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        westPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        westPoint.throughPoint = currentPointToVisit;
      }
      if (!westPoint.visited) {
        pointsQueue.queue(westPoint);
      }
    }
  }

  return null;
}
