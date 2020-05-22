import { GameConditions, GameState, Pellet, Pac, PacType } from "./game";
import { getSignalMatrix } from "./diffusion";
import { Point, areEqual, manhattanDistance } from "./geometry";
import { prettyPrintNumberMatrix } from "./debug";
import { PriorityQueue } from "./queues";

type DiffusionMatrices = {
  bigPelletDiffusionMatrix: number[][][][];
  smallPelletDiffusionMatrix: number[][][][];
  alliedPacDiffusionMatrix: number[][][][];
  killableEnemyPacDiffusionMatrix: number[][][][];
  nonKillableEnemyPacDiffusionMatrix: number[][][][];
};

type SignalPoints = {
  bigPelletPoints: Point[];
  smallPelletPoints: Point[];
  alliedPacPoints: Point[];
  killablePacPoints: Point[];
  nonKillablePacPoints: Point[];
};

let diffusionMatrices: DiffusionMatrices;

let pelletPointsHistory: boolean[][];

export function parseFirstInput(): GameConditions {
  let inputs: string[] = readline().split(" ");
  const width = parseInt(inputs[0]); // size of the grid
  const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)

  const map = [];
  pelletPointsHistory = [];
  for (let y = 0; y < height; y++) {
    const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    const cells: string[] = row.split("");
    map.push(cells);
    pelletPointsHistory[y] = [];
    for (let x = 0; x < cells.length; x++) {
      if (cells[x] === " ") {
        pelletPointsHistory[y][x] = true;
      }
    }
  }

  diffusionMatrices = initDiffusionMatrices(map);

  return { map, width, height };
}

export function initDiffusionMatrices(map: string[][]): DiffusionMatrices {
  let bigPelletDiffusionMatrix: number[][][][] = [],
    smallPelletDiffusionMatrix: number[][][][] = [],
    alliedPacDiffusionMatrix: number[][][][] = [],
    killableEnemyPacDiffusionMatrix: number[][][][] = [],
    nonKillableEnemyPacDiffusionMatrix: number[][][][] = [];
  for (let x = 0; x < map[0].length; x++) {
    bigPelletDiffusionMatrix[x] = [];
    smallPelletDiffusionMatrix[x] = [];
    alliedPacDiffusionMatrix[x] = [];
    killableEnemyPacDiffusionMatrix[x] = [];
    nonKillableEnemyPacDiffusionMatrix[x] = [];

    for (let y = 0; y < map.length; y++) {
      if (map[y][x] !== "#") {
        bigPelletDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          9,
          1,
          10
        );
        smallPelletDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          9,
          1,
          1
        );
        alliedPacDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          9,
          1,
          -5
        );
        killableEnemyPacDiffusionMatrix[x][y] = bigPelletDiffusionMatrix[x][y];
        nonKillableEnemyPacDiffusionMatrix[x][y] =
          alliedPacDiffusionMatrix[x][y];
      }
    }
  }

  return {
    bigPelletDiffusionMatrix,
    smallPelletDiffusionMatrix,
    alliedPacDiffusionMatrix,
    killableEnemyPacDiffusionMatrix,
    nonKillableEnemyPacDiffusionMatrix,
  };
}

export function getNewSignalMatrix(
  map: string[][],
  {
    bigPelletDiffusionMatrix,
    smallPelletDiffusionMatrix,
    alliedPacDiffusionMatrix,
    killableEnemyPacDiffusionMatrix,
    nonKillableEnemyPacDiffusionMatrix,
  }: DiffusionMatrices,
  {
    bigPelletPoints,
    smallPelletPoints,
    alliedPacPoints,
    killablePacPoints,
    nonKillablePacPoints,
  }: SignalPoints
): number[][] {
  let newSignalMatrix: number[][] = [];
  for (let y = 0; y < map.length; y++) {
    newSignalMatrix[y] = [];
    for (let x = 0; x < map[y].length; x++) {
      newSignalMatrix[y][x] = 0;
    }
  }

  bigPelletPoints.forEach((point) => {
    const pointMatrix = bigPelletDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  smallPelletPoints.forEach((point) => {
    const pointMatrix = smallPelletDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  alliedPacPoints.forEach((point) => {
    const pointMatrix = alliedPacDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  killablePacPoints.forEach((point) => {
    const pointMatrix = killableEnemyPacDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  nonKillablePacPoints.forEach((point) => {
    const pointMatrix = nonKillableEnemyPacDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  return newSignalMatrix;
}

export function updatePelletHistoryForPac(
  visiblePellets: Pellet[],
  pacPosition: Point,
  map: string[][]
): void {
  let visitingPoint = pacPosition;
  let visitedHorizontalPoints = 0;
  while (
    visitingPoint &&
    map[visitingPoint.y][visitingPoint.x] !== "#" &&
    visitedHorizontalPoints < 35
  ) {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      pelletPointsHistory[visitingPoint.y][visitingPoint.x] = false;
    }

    visitingPoint = {
      x: (visitingPoint.x + 1) % map[0].length,
      y: visitingPoint.y,
    };

    visitedHorizontalPoints++;
  }
  visitingPoint = pacPosition;
  visitedHorizontalPoints = 0;
  while (
    visitingPoint &&
    map[visitingPoint.y][visitingPoint.x] !== "#" &&
    visitedHorizontalPoints < 35
  ) {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      pelletPointsHistory[visitingPoint.y][visitingPoint.x] = false;
    }

    visitingPoint = {
      x: visitingPoint.x - 1 + (visitingPoint.x - 1 < 0 ? map[0].length : 0),
      y: visitingPoint.y,
    };

    visitedHorizontalPoints++;
  }
  visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      pelletPointsHistory[visitingPoint.y][visitingPoint.x] = false;
    }

    visitingPoint = { x: visitingPoint.x, y: visitingPoint.y + 1 };
  }
  visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      pelletPointsHistory[visitingPoint.y][visitingPoint.x] = false;
    }

    visitingPoint = { x: visitingPoint.x, y: visitingPoint.y - 1 };
  }
}

export function findPacDestinationsWithSignal(
  myPacs: Pac[],
  enemyPacs: Pac[],
  visiblePellets: Pellet[],
  map: string[][]
): { [pacId: number]: Point } {
  let pacDestinations: { [pacId: number]: Point } = {};

  let smallPelletPoints: Point[] = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (pelletPointsHistory[y][x]) {
        smallPelletPoints.push({ x, y });
      }
    }
  }

  myPacs
    .filter((pac) => pac.type !== "DEAD")
    .forEach((pac) => {
      let newPacMatrix = getNewSignalMatrix(map, diffusionMatrices, {
        bigPelletPoints: visiblePellets
          .filter((pellet) => pellet.value === 10)
          .map((pellet) => pellet.position),
        smallPelletPoints,
        alliedPacPoints: myPacs
          .filter(
            (repellingPac) =>
              repellingPac.id !== pac.id && repellingPac.type !== "DEAD"
          )
          .map((repellingPac) => repellingPac.position),
        killablePacPoints: enemyPacs
          .filter((enemyPac) => enemyPac.type === typeKills[pac.type])
          .map((enemyPac) => enemyPac.position),
        nonKillablePacPoints: enemyPacs
          .filter(
            (enemyPac) =>
              enemyPac.type !== typeKills[pac.type] && enemyPac.type !== "DEAD"
          )
          .map((enemyPac) => enemyPac.position),
      });
      console.error(`Matrix for pac ${pac.id}:`);
      console.error(prettyPrintNumberMatrix(newPacMatrix));

      pacDestinations[pac.id] = getHeighestValuePath(
        newPacMatrix,
        pac.position,
        map,
        3
      );
    });

  return pacDestinations;
}

export function getHeighestValuePath(
  signalMatrix: number[][],
  srcPoint: Point,
  map: string[][],
  maxDistance: number
): Point {
  type VisitingPoint = {
    point: Point;
    distanceToSrc: number;
    currentValue: number;
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
          ? null
          : {
              point: { x, y },
              distanceToSrc: Number.POSITIVE_INFINITY,
              visited: false,
              currentValue: 0,
            };
    }
  }

  visitedPointsMatrix[srcPoint.y][srcPoint.x].distanceToSrc = 0;
  visitedPointsMatrix[srcPoint.y][srcPoint.x].currentValue =
    signalMatrix[srcPoint.y][srcPoint.x];
  pointsQueue.queue(visitedPointsMatrix[srcPoint.y][srcPoint.x]);

  let highestValue = Number.NEGATIVE_INFINITY;
  let highestvaluePoint = null;

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
      if (northPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        northPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        northPoint.currentValue =
          currentPointToVisit.currentValue +
          signalMatrix[northPoint.point.y][northPoint.point.x];
      }
      if (northPoint.distanceToSrc <= maxDistance) {
        if (northPoint.currentValue > highestValue) {
          highestValue = northPoint.currentValue;
          highestvaluePoint = northPoint.point;
        }
        if (!northPoint.visited) {
          pointsQueue.queue(northPoint);
        }
      }
    }
    if (southPoint) {
      if (southPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        southPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        southPoint.currentValue =
          currentPointToVisit.currentValue +
          signalMatrix[southPoint.point.y][southPoint.point.x];
      }
      if (southPoint.distanceToSrc <= maxDistance) {
        if (southPoint.currentValue > highestValue) {
          highestValue = southPoint.currentValue;
          highestvaluePoint = southPoint.point;
        }
        if (!southPoint.visited) {
          pointsQueue.queue(southPoint);
        }
      }
    }
    if (eastPoint) {
      if (eastPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        eastPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        eastPoint.currentValue =
          currentPointToVisit.currentValue +
          signalMatrix[eastPoint.point.y][eastPoint.point.x];
      }
      if (eastPoint.distanceToSrc <= maxDistance) {
        if (eastPoint.currentValue > highestValue) {
          highestValue = eastPoint.currentValue;
          highestvaluePoint = eastPoint.point;
        }
        if (!eastPoint.visited) {
          pointsQueue.queue(eastPoint);
        }
      }
    }
    if (westPoint) {
      if (westPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        westPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
        westPoint.currentValue =
          currentPointToVisit.currentValue +
          signalMatrix[westPoint.point.y][westPoint.point.x];
      }
      if (westPoint.distanceToSrc <= maxDistance) {
        if (westPoint.currentValue > highestValue) {
          highestValue = westPoint.currentValue;
          highestvaluePoint = westPoint.point;
        }
        if (!westPoint.visited) {
          pointsQueue.queue(westPoint);
        }
      }
    }
  }
  console.error("Matrix for pac:");
  console.error(prettyPrintNumberMatrix(signalMatrix));
  console.error("Matrix of sum of paths: ");
  console.error(
    prettyPrintNumberMatrix(
      visitedPointsMatrix.map((line) =>
        line.map((point) =>
          point ? point.currentValue : Number.NEGATIVE_INFINITY
        )
      )
    )
  );

  return highestvaluePoint;
}

export function parseTurnInput(): GameState {
  var inputs: string[] = readline().split(" ");
  const myScore: number = parseInt(inputs[0]);
  const opponentScore: number = parseInt(inputs[1]);
  const visiblePacCount: number = parseInt(readline()); // all your pacs and enemy pacs in sight

  let myPacs: Pac[] = [];
  let enemyPacs: Pac[] = [];

  for (let i = 0; i < visiblePacCount; i++) {
    var inputs: string[] = readline().split(" ");
    const pacId: number = parseInt(inputs[0]); // pac number (unique within a team)
    const mine: boolean = inputs[1] !== "0"; // true if this pac is yours
    const x: number = parseInt(inputs[2]); // position in the grid
    const y: number = parseInt(inputs[3]); // position in the grid
    const type: PacType = inputs[4] as PacType;
    const speedTurnsLeft: number = parseInt(inputs[5]);
    const abilityCooldown: number = parseInt(inputs[6]);

    if (mine) {
      myPacs.push({
        id: pacId,
        position: { x, y },
        abilityCooldown,
        type,
        speedTurnsLeft,
      });
    } else {
      enemyPacs.push({
        id: pacId,
        position: { x, y },
        abilityCooldown,
        type,
        speedTurnsLeft,
      });
    }
  }
  const visiblePelletCount: number = parseInt(readline()); // all pellets in sight

  let visiblePellets: Pellet[] = [];
  for (let i = 0; i < visiblePelletCount; i++) {
    var inputs: string[] = readline().split(" ");
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
    const position: Point = { x, y };
    const value: number = parseInt(inputs[2]); // amount of points this pellet is worth
    visiblePellets.push({ position, value });
  }

  return { visiblePellets, myPacs, myScore, opponentScore, enemyPacs };
}

interface PelletDistance {
  pelletPoint: Point;
  pelletDistance: number;
}

export interface PacDestination {
  id: number;
  destinationPoint: Point;
  distance: number;
  value: number;
  pelletDistanceList: PelletDistance[];
}

export function updatePelletPointsHistory(
  myPacs: Pac[],
  visiblePellets: Pellet[],
  map: string[][]
) {
  myPacs
    .filter((pac) => pac.type !== "DEAD")
    .forEach((pac) => {
      console.error("updating pellet history for pac: " + pac.id);
      updatePelletHistoryForPac(visiblePellets, pac.position, map);
    });
}

export function getAbility(pac: Pac, enemyPacs: Pac[]): string {
  if (enemyPacs.length > 0) {
    enemyPacs.sort(
      (enemyPacA, enemyPacB) =>
        manhattanDistance(enemyPacA.position, pac.position) -
        manhattanDistance(enemyPacB.position, pac.position)
    );

    if (
      manhattanDistance(enemyPacs[0].position, pac.position) <= 3 &&
      pac.type !== typeIsKilledBy[enemyPacs[0].type] &&
      enemyPacs[0].type !== "DEAD"
    ) {
      return `SWITCH ${pac.id} ${typeIsKilledBy[enemyPacs[0].type]}`;
    }
  }

  return `SPEED ${pac.id}`;
}

const typeKills = {
  ROCK: "SCISSORS",
  PAPER: "ROCK",
  SCISSORS: "PAPER",
  DEAD: "DEAD",
};

const typeIsKilledBy = {
  ROCK: "PAPER",
  PAPER: "SCISSORS",
  SCISSORS: "ROCK",
  DEAD: "DEAD",
};
