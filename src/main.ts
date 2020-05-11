/**
 * Grab the pellets as fast as you can!
 **/

import { Point } from "./geometry";
import { Pac } from "./game";
import { storeInput } from "./local";

import { runLocally } from "./local";
import {
  parseFirstInput,
  parseTurnInput,
  findPacDestinations,
  findPathToDestinations,
} from "./gameEngine";

//storeInput();
//runLocally("./src/replays/replay_2.txt");

const { map } = parseFirstInput();

let oldVisiblePacs: Pac[] = [];
let bumpIterations: number[] = [];
let lastRandomDestinationPath: { [pacId: number]: Point[] } = {};
// game loop
while (true) {
  let { visiblePellets, visiblePacs } = parseTurnInput();

  // TODO: refactor this and separate destination logic from path logic

  const pacDestinations = findPacDestinations(
    visiblePacs,
    visiblePellets,
    oldVisiblePacs,
    bumpIterations,
    lastRandomDestinationPath,
    map
  );

  const pacPaths = findPathToDestinations(pacDestinations, visiblePacs, map);

  let orders = "";

  visiblePacs.forEach((pac) => {
    if (pac.abilityCooldown === 0) {
      orders += `SPEED ${pac.id} | `;
    } else {
      const destinationPoint = pacPaths[pac.id][0];
      orders += `MOVE ${pac.id} ${destinationPoint.x} ${destinationPoint.y} | `;
    }
  });

  console.log(orders);
  oldVisiblePacs = visiblePacs;
  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
}
