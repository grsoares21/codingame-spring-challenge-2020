/**
 * Grab the pellets as fast as you can!
 **/

import { Point, manhattanDistance } from "./geometry";
import { areEqual } from "./geometry";

var inputs: string[] = readline().split(" ");
const width: number = parseInt(inputs[0]); // size of the grid
const height: number = parseInt(inputs[1]); // top left corner is (x=0, y=0)
for (let i = 0; i < height; i++) {
  const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
}

let oldPacPoint: Point = { x: -1, y: -1 };
let bumpIterations = 1;
// game loop
while (true) {
  var inputs: string[] = readline().split(" ");
  const myScore: number = parseInt(inputs[0]);
  const opponentScore: number = parseInt(inputs[1]);
  const visiblePacCount: number = parseInt(readline()); // all your pacs and enemy pacs in sight

  let pacPoint: Point;

  for (let i = 0; i < visiblePacCount; i++) {
    var inputs: string[] = readline().split(" ");
    const pacId: number = parseInt(inputs[0]); // pac number (unique within a team)
    const mine: boolean = inputs[1] !== "0"; // true if this pac is yours
    const x: number = parseInt(inputs[2]); // position in the grid
    const y: number = parseInt(inputs[3]); // position in the grid
    if (mine) {
      pacPoint = { x, y };
    }
    //const typeId: string = inputs[4]; // unused in wood leagues
    //const speedTurnsLeft: number = parseInt(inputs[5]); // unused in wood leagues
    //const abilityCooldown: number = parseInt(inputs[6]); // unused in wood leagues
  }
  const visiblePelletCount: number = parseInt(readline()); // all pellets in sight

  let minDistance = Number.POSITIVE_INFINITY;
  let currentMinValue = 0;
  let destinationPoint: Point;
  let pelletDistanceList: { pelletPoint: Point; pelletDistance: number }[] = [];

  for (let i = 0; i < visiblePelletCount; i++) {
    var inputs: string[] = readline().split(" ");
    const x: number = parseInt(inputs[0]);
    const y: number = parseInt(inputs[1]);
    const pelletPoint: Point = { x, y };
    const value: number = parseInt(inputs[2]); // amount of points this pellet is worth

    const pelletDistance = manhattanDistance(pacPoint, pelletPoint);
    if (
      (pelletDistance < minDistance || value > currentMinValue) &&
      !areEqual(pacPoint, oldPacPoint)
    ) {
      currentMinValue = value;
      minDistance = pelletDistance;
      destinationPoint = pelletPoint;
      /*if (pelletDistance < 4) {
        console.error(
          `Min dist: ${minDistance}, Pac point: ${JSON.stringify(
            pacPoint
          )}, Pellet point: ${JSON.stringify(
            pelletPoint
          )}, pellet value ${value}`
        );
      }*/
    } else if (areEqual(pacPoint, oldPacPoint)) {
      pelletDistanceList.push({ pelletPoint, pelletDistance });
    }
  }
  if (!destinationPoint) {
    pelletDistanceList.sort(
      (pelletA, pelletB) => pelletA.pelletDistance - pelletB.pelletDistance
    );

    destinationPoint = pelletDistanceList[bumpIterations].pelletPoint;
    bumpIterations++;
  } else {
    bumpIterations = 1;
  }
  console.error(
    `Bump it: ${bumpIterations}, Dest point: ${JSON.stringify(
      destinationPoint
    )}`
  );
  console.log(`MOVE 0 ${destinationPoint.x} ${destinationPoint.y}`); // MOVE <pacId> <x> <y>
  oldPacPoint = pacPoint;
  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
}
