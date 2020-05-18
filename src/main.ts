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
//runLocally("./src/replays/replay_6.txt");
const { map } = parseFirstInput();
// game loop
while (true) {
  let { visiblePellets, myPacs, enemyPacs } = parseTurnInput();

  if (
    myPacs.some(
      (pac) => pac.id === 0 && pac.position.x === 21 && pac.position.y === 7
    )
  ) {
    debugger;
  }
  const initialTime = new Date().getTime();
  const pacDestinations = findPacDestinationsWithSignal(
    myPacs,
    visiblePellets,
    map
  );
  console.error(
    `Time to find destinations: ${new Date().getTime() - initialTime}ms`
  );
  //console.error(`Pac destinations: ${JSON.stringify(pacDestinations)}`);
  /*const pacPaths = findPathToDestinations(
    pacDestinations,
    myPacs,
    enemyPacs,
    map
  );*/
  //console.error(`Path paths: ${JSON.stringify(pacPaths)}`);

  let orders = "";

  myPacs
    .filter((pac) => pac.type !== "DEAD")
    .forEach((pac) => {
      if (pac.abilityCooldown === 0) {
        orders += `${getAbility(pac, enemyPacs)} | `;
      } else {
        let destinationPoint = pacDestinations[pac.id];

        orders += `MOVE ${pac.id} ${destinationPoint.x} ${destinationPoint.y} | `;
      }
    });

  console.log(orders);
  // Write an action using console.log()
  // To debug: console.error('Debug messages...');
}
