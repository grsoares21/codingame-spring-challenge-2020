import { Point } from "./geometry";
import { PriorityQueue } from "./queues";

export function getSignalMatrix(
  map: string[][],
  singalPoint: Point,
  maxSignalDistance: number,
  diffusionFactor: number,
  signalPointValue: number
): number[][] {
  type VisitingPoint = {
    point: Point;
    value: number;
    distanceToSrc: number;
    visited: boolean;
  };

  const pointsQueue = new PriorityQueue<VisitingPoint>({
    comparator: function (pointA, pointB) {
      const pointATotalDistance = pointA.distanceToSrc;
      const pointBTotalDistance = pointB.distanceToSrc;
      return pointATotalDistance - pointBTotalDistance;
    },
  });

  let visitedPointsMatrix: VisitingPoint[][] = [];

  for (let y = 0; y < map.length; y++) {
    visitedPointsMatrix[y] = [];
    for (let x = 0; x < map[y].length; x++) {
      visitedPointsMatrix[y][x] =
        map[y][x] === "#"
          ? {
              point: { x, y },
              value: Number.NEGATIVE_INFINITY,
              distanceToSrc: -1,
              visited: true,
            }
          : {
              point: { x, y },
              distanceToSrc: Number.POSITIVE_INFINITY,
              visited: false,
              value: 0,
            };
    }
  }

  visitedPointsMatrix[singalPoint.y][singalPoint.x].distanceToSrc = 0;
  visitedPointsMatrix[singalPoint.y][singalPoint.x].value = signalPointValue;
  pointsQueue.queue(visitedPointsMatrix[singalPoint.y][singalPoint.x]);

  while (pointsQueue.length > 0) {
    const currentPointToVisit = pointsQueue.dequeue();
    currentPointToVisit.visited = true;

    const width = visitedPointsMatrix[currentPointToVisit.point.y].length;

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
        (currentPointToVisit.point.x + 1) % width
      ];
    const westPoint =
      visitedPointsMatrix[currentPointToVisit.point.y][
        currentPointToVisit.point.x -
          1 +
          (currentPointToVisit.point.x - 1 < 0 ? width : 0)
      ];
    if (northPoint) {
      if (
        !northPoint.visited &&
        currentPointToVisit.distanceToSrc + 1 < maxSignalDistance
      ) {
        northPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        northPoint.value =
          signalPointValue /
          Math.pow(northPoint.distanceToSrc + 1, diffusionFactor);

        pointsQueue.queue(northPoint);
      }
    }
    if (southPoint) {
      if (
        !southPoint.visited &&
        currentPointToVisit.distanceToSrc + 1 < maxSignalDistance
      ) {
        southPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        southPoint.value =
          signalPointValue /
          Math.pow(southPoint.distanceToSrc + 1, diffusionFactor);

        pointsQueue.queue(southPoint);
      }
    }
    if (eastPoint) {
      if (
        !eastPoint.visited &&
        currentPointToVisit.distanceToSrc + 1 < maxSignalDistance
      ) {
        eastPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        eastPoint.value =
          signalPointValue /
          Math.pow(eastPoint.distanceToSrc + 1, diffusionFactor);

        pointsQueue.queue(eastPoint);
      }
    }
    if (westPoint) {
      if (
        !westPoint.visited &&
        currentPointToVisit.distanceToSrc + 1 < maxSignalDistance
      ) {
        westPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        westPoint.value =
          signalPointValue /
          Math.pow(westPoint.distanceToSrc + 1, diffusionFactor);

        pointsQueue.queue(westPoint);
      }
    }
  }
  let returnedMatrix = [];

  for (let y = 0; y < visitedPointsMatrix.length; ++y) {
    returnedMatrix[y] = [];
    for (let x = 0; x < visitedPointsMatrix[y].length; ++x) {
      returnedMatrix[y][x] = visitedPointsMatrix[y][x].value;
    }
  }
  return visitedPointsMatrix.map((line) =>
    line.map((visitingPoint) => visitingPoint.value)
  );
}
