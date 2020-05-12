import { GameConditions, GameState, Pellet, Pac } from "./game";
import {
  Point,
  areEqual,
  manhattanDistance,
  findRandomAvailablePosition,
  findPath,
} from "./geometry";

export function parseFirstInput(): GameConditions {
  let inputs: string[] = readline().split(" ");
  const width = parseInt(inputs[0]); // size of the grid
  const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)

  const map = [];
  for (let i = 0; i < height; i++) {
    const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    map.push(row.split(""));
  }

  return { map, width, height };
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
    const abilityCooldown: number = parseInt(inputs[6]); // unused in wood leagues

    // TODO: add all pacs tothe list
    if (mine) {
      myPacs.push({ id: pacId, position: { x, y }, abilityCooldown });
    } else {
      enemyPacs.push({ id: pacId, position: { x, y }, abilityCooldown });
    }
    //const typeId: string = inputs[4]; // unused in wood leagues
    //const speedTurnsLeft: number = parseInt(inputs[5]); // unused in wood leagues
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
    myPacs.sort(
      (pacA, pacB) =>
        manhattanDistance(pacA.position, currentPellet.position) -
        manhattanDistance(pacB.position, currentPellet.position)
    );

    for (let i = 0; i < myPacs.length; i++) {
      let currentPac = myPacs[i];
      let currentPacDistance = manhattanDistance(
        currentPellet.position,
        currentPac.position
      );
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
          currentPacDistance < pacDestinations[currentPac.id].distance)
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
    pacPaths[pacId] = pacPath;
    if (pacPath) {
      newMap[pacPath[0].y][pacPath[0].x] = "#";
    }
    newMap[currentPac.position.y][currentPac.position.x] = "#";
  }

  return pacPaths;
}
