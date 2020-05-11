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

// game loop
while (true) {
  let { visiblePellets, visiblePacs } = parseTurnInput();

  const pacDestinations = findPacDestinations(visiblePacs, visiblePellets, map);
  const pacPaths = findPathToDestinations(pacDestinations, visiblePacs, map);

  let orders = "";

  visiblePacs.forEach((pac) => {
    if (pac.abilityCooldown === 0) {
      orders += `SPEED ${pac.id} | `;
    } else {
      let destinationPoint: Point;
      if (pacPaths[pac.id]) {
        destinationPoint =
          pacPaths[pac.id].length > 1
            ? pacPaths[pac.id][1]
            : pacPaths[pac.id][0];
      } else {
        destinationPoint = pac.position;
      }
      orders += `MOVE ${pac.id} ${destinationPoint.x} ${destinationPoint.y} | `;
    }
  });

  console.log(orders);
  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
}
