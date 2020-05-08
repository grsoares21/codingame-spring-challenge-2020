/**
 * Grab the pellets as fast as you can!
 **/

import {
  Point,
  manhattanDistance,
  findFirstAvailablePosition,
} from "./geometry";
import { areEqual } from "./geometry";
import { Pac, PacDestination } from "./game";
import { storeInput } from "./local";

import { runLocally } from "./local";

//storeInput();
//runLocally("./src/replays/replay_0.txt");

var inputs: string[] = readline().split(" ");
const width: number = parseInt(inputs[0]); // size of the grid
const height: number = parseInt(inputs[1]); // top left corner is (x=0, y=0)

const map: string[][] = [];
for (let i = 0; i < height; i++) {
  const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
  map.push(row.split(""));
}

let oldPacList: Pac[] = [];
let bumpIterations: number[] = [];
// game loop
while (true) {
  var inputs: string[] = readline().split(" ");
  const myScore: number = parseInt(inputs[0]);
  const opponentScore: number = parseInt(inputs[1]);
  const visiblePacCount: number = parseInt(readline()); // all your pacs and enemy pacs in sight

  let pacList: Pac[] = [];

  for (let i = 0; i < visiblePacCount; i++) {
    var inputs: string[] = readline().split(" ");
    const pacId: number = parseInt(inputs[0]); // pac number (unique within a team)
    const mine: boolean = inputs[1] !== "0"; // true if this pac is yours
    const x: number = parseInt(inputs[2]); // position in the grid
    const y: number = parseInt(inputs[3]); // position in the grid
    const abilityCooldown: number = parseInt(inputs[6]); // unused in wood leagues

    if (mine) {
      pacList.push({ id: pacId, position: { x, y }, abilityCooldown });
    }
    //const typeId: string = inputs[4]; // unused in wood leagues
    //const speedTurnsLeft: number = parseInt(inputs[5]); // unused in wood leagues
  }
  const visiblePelletCount: number = parseInt(readline()); // all pellets in sight

  let pacDestinations: { [key: number]: PacDestination } = {};

  pacList.forEach((pac) => {
    pacDestinations[pac.id] = {
      id: pac.id,
      destinationPoint: null,
      distance: Number.POSITIVE_INFINITY,
      value: 0,
      pelletDistanceList: [],
    };
  });

  for (let i = 0; i < visiblePelletCount; i++) {
    var inputs: string[] = readline().split(" ");
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
    const pelletPoint: Point = { x, y };
    const value: number = parseInt(inputs[2]); // amount of points this pellet is worth

    for (let j = 0; j < pacList.length; j++) {
      let pelletAvailable = true;
      for (let { destinationPoint } of Object.values(pacDestinations)) {
        if (destinationPoint && areEqual(destinationPoint, pelletPoint)) {
          pelletAvailable = false;
          break;
        }
      }

      if (!pelletAvailable) {
        continue;
      }

      const pelletDistance = manhattanDistance(
        pacList[j].position,
        pelletPoint
      );

      if (
        (pelletDistance < pacDestinations[pacList[j].id].distance ||
          value > pacDestinations[pacList[j].id].value) &&
        (!oldPacList[j] ||
          !areEqual(pacList[j].position, oldPacList[j].position))
      ) {
        pacDestinations[pacList[j].id].value = value;
        pacDestinations[pacList[j].id].distance = pelletDistance;
        pacDestinations[pacList[j].id].destinationPoint = pelletPoint;
      } else if (
        oldPacList[j] &&
        areEqual(pacList[j].position, oldPacList[j].position)
      ) {
        pacDestinations[pacList[j].id].pelletDistanceList.push({
          pelletPoint,
          pelletDistance,
        });
      }
    }
  }

  for (let i = 0; i < pacList.length; i++) {
    let pacId = pacList[i].id;
    let pacDestination = pacDestinations[pacId];
    if (!pacDestination.destinationPoint) {
      pacDestination.pelletDistanceList.sort(
        (pelletA, pelletB) => pelletA.pelletDistance - pelletB.pelletDistance
      );
      if (pacDestination.pelletDistanceList.length > bumpIterations[i]) {
        pacDestination.destinationPoint =
          pacDestination.pelletDistanceList[bumpIterations[i]].pelletPoint;
        bumpIterations[i]++;
      } else if (pacDestination.pelletDistanceList.length > 0) {
        pacDestination.destinationPoint =
          pacDestination.pelletDistanceList[0].pelletPoint;
      } else {
        pacDestination.destinationPoint = findFirstAvailablePosition(map);
      }
    } else {
      bumpIterations[i] = 1;
    }
  }

  let orders = "";

  pacList.forEach((pac) => {
    if (pac.abilityCooldown === 0) {
      orders += `SPEED ${pac.id} | `;
    } else {
      let { id, destinationPoint } = pacDestinations[pac.id];
      orders += `MOVE ${id} ${destinationPoint.x} ${destinationPoint.y} | `;
    }
  });

  console.log(orders);
  oldPacList = pacList;
  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
}
