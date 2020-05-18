import { GameConditions, GameState, Pellet, Pac, PacType } from "./game";
import { getSignalMatrix } from "./diffusion";
import {
  Point,
  areEqual,
  manhattanDistance,
  findRandomAvailablePosition,
  findPath,
} from "./geometry";
import { prettyPrintNumberMatrix } from "./debug";
import { PriorityQueue } from "./queues";

type DiffusionMatrices = {
  bigPelletDiffusionMatrix: number[][][][];
  //attractiveDiffusionMatrix: number[][][][];
  smallPelletDiffusionMatrix: number[][][][];
  //highlyRepellingDiffusionMatrix: number[][][][];
  alliedPacDiffusionMatrix: number[][][][];
  pelletAbsenceDiffusionMatrix: number[][][][];
};

type SignalPoints = {
  bigPelletPoints: Point[];
  //attracivePoints: Point[];
  smallPelletPoints: Point[];
  //highlyRepellingPoints: Point[];
  alliedPacPoints: Point[];
  pelletAbsencePoints: Point[];
};

let diffusionMatrices: DiffusionMatrices;

export function parseFirstInput(): GameConditions {
  let inputs: string[] = readline().split(" ");
  const width = parseInt(inputs[0]); // size of the grid
  const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)

  const map = [];
  for (let i = 0; i < height; i++) {
    const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    map.push(row.split(""));
  }

  diffusionMatrices = initDiffusionMatrices(map);

  return { map, width, height };
}

export function initDiffusionMatrices(map: string[][]): DiffusionMatrices {
  let bigPelletDiffusionMatrix: number[][][][] = [],
    //attractiveDiffusionMatrix: number[][][][] = [],
    smallPelletDiffusionMatrix: number[][][][] = [],
    //highlyRepellingDiffusionMatrix: number[][][][] = [],
    alliedPacDiffusionMatrix: number[][][][] = [],
    pelletAbsenceDiffusionMatrix: number[][][][] = [];
  for (let x = 0; x < map[0].length; x++) {
    bigPelletDiffusionMatrix[x] = [];
    //attractiveDiffusionMatrix[x] = [];
    smallPelletDiffusionMatrix[x] = [];
    //highlyRepellingDiffusionMatrix[x] = [];
    alliedPacDiffusionMatrix[x] = [];
    pelletAbsenceDiffusionMatrix[x] = [];
    for (let y = 0; y < map.length; y++) {
      if (map[y][x] !== "#") {
        bigPelletDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          10,
          1.5,
          10
        );
        /*attractiveDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          10,
          0.9,
          5
        );*/
        smallPelletDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          10,
          1.5,
          1
        );

        /*highlyRepellingDiffusionMatrix[x][y] = bigPelletDiffusionMatrix[
          x
        ][y].map((line) =>
          line.map((num) => (num === Number.NEGATIVE_INFINITY ? num : -num))
        );*/
        alliedPacDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          10,
          1.5,
          -10
        );
        pelletAbsenceDiffusionMatrix[x][y] = getSignalMatrix(
          map,
          { x, y },
          10,
          1.5,
          0
        );
      }
    }
  }

  return {
    bigPelletDiffusionMatrix,
    smallPelletDiffusionMatrix,
    alliedPacDiffusionMatrix,
    pelletAbsenceDiffusionMatrix,
  };
}

export function getNewSignalMatrix(
  map: string[][],
  oldSignalMatrix: number[][],
  {
    bigPelletDiffusionMatrix,
    smallPelletDiffusionMatrix,
    alliedPacDiffusionMatrix,
    pelletAbsenceDiffusionMatrix,
  }: DiffusionMatrices,
  {
    bigPelletPoints,
    smallPelletPoints,
    alliedPacPoints,
    pelletAbsencePoints,
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

  pelletAbsencePoints.forEach((point) => {
    const pointMatrix = pelletAbsenceDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  /* repellingPoints.forEach((point) => {
    const pointMatrix = repellingDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });

  slightlyRepellingPoints.forEach((point) => {
    const pointMatrix = slightlyRepellingDiffusionMatrix[point.x][point.y];
    for (let y = 0; y < pointMatrix.length; y++) {
      for (let x = 0; x < pointMatrix[y].length; x++) {
        newSignalMatrix[y][x] += pointMatrix[y][x];
      }
    }
  });*/

  if (oldSignalMatrix) {
    for (let y = 0; y < newSignalMatrix.length; y++) {
      for (let x = 0; x < newSignalMatrix.length; x++) {
        // null in newSignalMatrix ? console.error(`New matrix: ${JSON.stringify(newSignalMatrix)} `);
        //console.error(`Old matrix: ${oldSignalMatrix} `);
        newSignalMatrix[y][x] =
          0.75 * newSignalMatrix[y][x] + 0.25 * oldSignalMatrix[y][x];
      }
    }
  }

  return newSignalMatrix;
}

let previousSignalMatrices: { [pacId: number]: number[][] } = {};

export function findAbsentPellets(
  visiblePellets: Pellet[],
  pacPosition: Point,
  map: string[][]
): Point[] {
  let pelletAbsence: Point[] = [];
  let visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      if (!pelletAbsence.some((absence) => areEqual(absence, visitingPoint))) {
        pelletAbsence.push(visitingPoint);
      }
    }

    visitingPoint = {
      x: (visitingPoint.x + 1) % map[0].length,
      y: visitingPoint.y,
    };
  }
  visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      if (!pelletAbsence.some((absence) => areEqual(absence, visitingPoint))) {
        pelletAbsence.push(visitingPoint);
      }
    }

    visitingPoint = {
      x: visitingPoint.x - 1 + (visitingPoint.x - 1 < 0 ? map[0].length : 0),
      y: visitingPoint.y,
    };
  }
  visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      if (!pelletAbsence.some((absence) => areEqual(absence, visitingPoint))) {
        pelletAbsence.push(visitingPoint);
      }
    }

    visitingPoint = { x: visitingPoint.x, y: visitingPoint.y + 1 };
  }
  visitingPoint = pacPosition;
  while (visitingPoint && map[visitingPoint.y][visitingPoint.x] !== "#") {
    if (
      !visiblePellets.some((pellet) => areEqual(pellet.position, visitingPoint))
    ) {
      if (!pelletAbsence.some((absence) => areEqual(absence, visitingPoint))) {
        pelletAbsence.push(visitingPoint);
      }
    }

    visitingPoint = { x: visitingPoint.x, y: visitingPoint.y - 1 };
  }

  return pelletAbsence;
}

export function findPacDestinationsWithSignal(
  myPacs: Pac[],
  visiblePellets: Pellet[],
  map: string[][]
): { [pacId: number]: Point } {
  let pacDestinations: { [pacId: number]: Point } = {};

  myPacs.forEach((pac) => {
    // TODO: add tunnel connection and repelling/attracting enemies, add speed consideration
    let pelletAbsencePoints: Point[] = findAbsentPellets(
      visiblePellets,
      pac.position,
      map
    );

    let newPacMatrix = getNewSignalMatrix(
      map,
      previousSignalMatrices[pac.id],
      diffusionMatrices,
      {
        bigPelletPoints: visiblePellets
          .filter((pellet) => pellet.value === 10)
          .map((pellet) => pellet.position),
        smallPelletPoints: visiblePellets
          .filter((pellet) => pellet.value === 1)
          .map((pellet) => pellet.position),
        alliedPacPoints: myPacs
          .filter((repellingPac) => repellingPac.id !== pac.id)
          .map((repellingPac) => repellingPac.position),
        pelletAbsencePoints,
      }
    );
    previousSignalMatrices[pac.id] = newPacMatrix;
    console.error(`Matrix for pac ${pac.id}:`);
    console.error(prettyPrintNumberMatrix(newPacMatrix));

    pacDestinations[pac.id] = getHeighestValueNeighbour(
      newPacMatrix,
      pac.position,
      map,
      pac.speedTurnsLeft > 0 ? 2 : 1
    );
  });

  return pacDestinations;
}

export function getHeighestValueNeighbour(
  signalMatrix: number[][],
  srcPoint: Point,
  map: string[][],
  maxDistance: 1 | 2
): Point {
  type VisitingPoint = {
    point: Point;
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
          ? null
          : {
              point: { x, y },
              distanceToSrc: Number.POSITIVE_INFINITY,
              visited: false,
            };
    }
  }

  visitedPointsMatrix[srcPoint.y][srcPoint.x].distanceToSrc = 0;
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
      }
      if (!northPoint.visited && northPoint.distanceToSrc <= maxDistance) {
        if (
          signalMatrix[northPoint.point.y][northPoint.point.x] > highestValue
        ) {
          highestValue = signalMatrix[northPoint.point.y][northPoint.point.x];
          highestvaluePoint = northPoint.point;
        }
        pointsQueue.queue(northPoint);
      }
    }
    if (southPoint) {
      if (southPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        southPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
      }
      if (!southPoint.visited && southPoint.distanceToSrc <= maxDistance) {
        if (
          signalMatrix[southPoint.point.y][southPoint.point.x] > highestValue
        ) {
          highestValue = signalMatrix[southPoint.point.y][southPoint.point.x];
          highestvaluePoint = southPoint.point;
        }
        pointsQueue.queue(southPoint);
      }
    }
    if (eastPoint) {
      if (eastPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        eastPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
      }
      if (!eastPoint.visited && eastPoint.distanceToSrc <= maxDistance) {
        if (signalMatrix[eastPoint.point.y][eastPoint.point.x] > highestValue) {
          highestValue = signalMatrix[eastPoint.point.y][eastPoint.point.x];
          highestvaluePoint = eastPoint.point;
        }
        pointsQueue.queue(eastPoint);
      }
    }
    if (westPoint) {
      if (westPoint.distanceToSrc > currentPointToVisit.distanceToSrc + 1) {
        westPoint.distanceToSrc = currentPointToVisit.distanceToSrc + 1;
      }
      if (!westPoint.visited && westPoint.distanceToSrc <= maxDistance) {
        if (signalMatrix[westPoint.point.y][westPoint.point.x] > highestValue) {
          highestValue = signalMatrix[westPoint.point.y][westPoint.point.x];
          highestvaluePoint = westPoint.point;
        }
        pointsQueue.queue(westPoint);
      }
    }
  }
  console.error(`Destination point: ${highestvaluePoint}`);
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

let pacLastRandomDestinations: { [pacId: number]: Point } = {};

export function findPacDestinations(
  myPacs: Pac[],
  visiblePellets: Pellet[],
  map: string[][]
): { [pacId: number]: Point } {
  let pacDestinations: { [pacId: number]: PacDestination } = {};

  myPacs.forEach((pac) => {
    pacDestinations[pac.id] = {
      id: pac.id,
      destinationPoint: null,
      distance: Number.POSITIVE_INFINITY,
      value: 0,
      pelletDistanceList: [],
    };
  });

  let pelletPool = [...visiblePellets];

  while (pelletPool.length > 0) {
    let currentPellet = pelletPool.pop();
    myPacs.sort((pacA, pacB) => {
      let pathPacA = findPath(map, pacA.position, currentPellet.position);
      let pathPacB = findPath(map, pacB.position, currentPellet.position);

      return (
        (pathPacA?.distance ?? Number.POSITIVE_INFINITY) -
        (pathPacB?.distance ?? Number.POSITIVE_INFINITY)
      );
    });

    for (let i = 0; i < myPacs.length; i++) {
      let currentPac = myPacs[i];
      let currentPacPath = findPath(
        map,
        currentPac.position,
        currentPellet.position
      );
      let currentPacDistance = currentPacPath
        ? currentPacPath.distance
        : Number.POSITIVE_INFINITY;

      if (currentPacDistance > 10) {
        continue;
      }
      if (!pacDestinations[currentPac.id].destinationPoint) {
        pacDestinations[currentPac.id].destinationPoint =
          currentPellet.position;
        pacDestinations[currentPac.id].distance = currentPacDistance;
        pacDestinations[currentPac.id].value = currentPellet.value;
        pacLastRandomDestinations[currentPac.id] = null;
        break;
      } else if (
        currentPellet.value > pacDestinations[currentPac.id].value ||
        (currentPellet.value === pacDestinations[currentPac.id].value &&
          currentPacDistance < pacDestinations[currentPac.id].distance &&
          currentPac.speedTurnsLeft === 0) ||
        (currentPac.speedTurnsLeft > 0 &&
          currentPellet.value === pacDestinations[currentPac.id].value &&
          currentPacDistance < pacDestinations[currentPac.id].distance &&
          currentPacDistance > 1)
      ) {
        pelletPool.push(
          visiblePellets.find((p) =>
            areEqual(
              pacDestinations[currentPac.id].destinationPoint,
              p.position
            )
          )
        );
        pacDestinations[currentPac.id].destinationPoint =
          currentPellet.position;
        pacDestinations[currentPac.id].distance = currentPacDistance;
        pacDestinations[currentPac.id].value = currentPellet.value;
        pacLastRandomDestinations[currentPac.id] = null;
        break;
      }
    }
  }

  for (let i = 0; i < myPacs.length; i++) {
    let pacId = myPacs[i].id;
    let pacDestination = pacDestinations[pacId];
    if (!pacDestination.destinationPoint) {
      // no pellets visible
      const lastRandomDestination = pacLastRandomDestinations[pacId];

      if (
        !lastRandomDestination ||
        areEqual(pacLastRandomDestinations[pacId], myPacs[i].position)
      ) {
        pacLastRandomDestinations[pacId] = findRandomAvailablePosition(map);
      }

      pacDestination.destinationPoint = pacLastRandomDestinations[pacId];
    }
  }

  let pacDestinationPoints: { [pacId: number]: Point } = {};
  for (let { id, destinationPoint } of Object.values(pacDestinations)) {
    pacDestinationPoints[id] = destinationPoint;
  }

  return pacDestinationPoints;
}

export function findPathToDestinations(
  pacDestinations: {
    [pacId: number]: Point;
  },
  myPacs: Pac[],
  enemyPacs: Pac[],
  map: string[][]
): { [pacId: number]: Point[] } {
  let pacPaths: { [pacId: number]: Point[] } = {};
  let pacPoints = myPacs.map((pac) => pac.position);
  let enemyPacPoints = enemyPacs.map((pac) => pac.position);
  let newMap = map.map((line) => [...line]);
  pacPoints.forEach((point) => {
    newMap[point.y][point.x] = "#";
  });
  enemyPacPoints.forEach((point) => {
    newMap[point.y][point.x] = "#";
  });
  for (let pacId of Object.keys(pacDestinations).map((key) => parseInt(key))) {
    let currentPac = myPacs.find((pac) => pac.id === pacId);
    newMap[currentPac.position.y][currentPac.position.x] = " ";
    const pacPath = findPath(
      newMap,
      currentPac.position,
      pacDestinations[pacId]
    );

    pacPaths[pacId] = pacPath ? pacPath.path : null;
    if (pacPath?.path.length > 1) {
      newMap[pacPath.path[1].y][pacPath.path[1].x] = "#";
    }
    newMap[currentPac.position.y][currentPac.position.x] = "#";
  }

  return pacPaths;
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
