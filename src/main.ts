/**
 * Grab the pellets as fast as you can!
 **/

import { Point } from "./geometry";
import { Pac } from "./game";
import { storeInput } from "./debug";

import { runLocally } from "./debug";
import {
  parseFirstInput,
  parseTurnInput,
  findPacDestinations,
  findPathToDestinations,
  getAbility,
  findPacDestinationsWithSignal,
} from "./gameEngine";

//storeInput();
//runLocally("./src/replays/replay_5.txt");
const { map } = parseFirstInput();
// game loop
while (true) {
  let { visiblePellets, myPacs, enemyPacs } = parseTurnInput();

  /*if (
    myPacs.some(
      (pac) => pac.id === 0 && pac.position.x === 22 && pac.position.y === 9
    )
  ) {
    debugger;
  }*/
  const pacDestinations = findPacDestinationsWithSignal(
    myPacs,
    visiblePellets,
    map
  );
  //console.error(`Pac destinations: ${JSON.stringify(pacDestinations)}`);
  const pacPaths = findPathToDestinations(
    pacDestinations,
    myPacs,
    enemyPacs,
    map
  );
  //console.error(`Path paths: ${JSON.stringify(pacPaths)}`);

  let orders = "";

  myPacs.forEach((pac) => {
    if (pac.abilityCooldown === 0) {
      orders += `${getAbility(pac, enemyPacs)} | `;
    } else {
      let destinationPoint: Point;
      if (pacPaths[pac.id]) {
        destinationPoint =
          pacPaths[pac.id].length > 2
            ? pacPaths[pac.id][2]
            : pacPaths[pac.id].length > 1
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
