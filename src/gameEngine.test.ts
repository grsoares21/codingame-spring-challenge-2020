import { initDiffusionMatrices, getNewSignalMatrix } from "./gameEngine";

it(`should init highly attractive slightly attractive and repelling matrices`, () => {
  let map = getMap();
  let diffusionMatrices = initDiffusionMatrices(map);

  /* expect(
    prettyPrintNumberMatrix(
      diffusionMatrices.bigPelletDiffusionMatrix[1][1]
    )
  ).toMatchSnapshot();
  expect(
    prettyPrintNumberMatrix(
      diffusionMatrices.slightlyRepellingDiffusionMatrix[14][7]
    )
  ).toMatchSnapshot();
  expect(
    prettyPrintNumberMatrix(
      diffusionMatrices.smallPelletDiffusionMatrixnMatrixnMatrix[16][7]
    )
  ).toMatchSnapshot();
});

it(`should get first combined signal matrix`, () => {
  let map = getMap();
  let diffusionMatrices = initDiffusionMatrices(map);
  let firstSignalMatrix = getNewSignalMatrix(map, null, diffusionMatrices, {
    highlyAttracivePoints: [],
    attracivePoints: [],
    slightlyAttractivePoints: [],
    highlyRepellingPoints: [],
    repellingPoints: [],
    slightlyRepellingPoints: [],
  });
  expect(prettyPrintNumberMatrix(firstSignalMatrix)).toMatchSnapshot();*/
});

function prettyPrintNumberMatrix(matrix: number[][]): string {
  return matrix
    .map((line) =>
      line
        .map((num) => num.toFixed(1))
        .map((num) => (num === "-Infinity" ? "###" : num))
        .join(" ")
    )
    .join("\n");
}

function getMap(): string[][] {
  // prettier-ignore
  return [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#',' ','#',' ',' ',' ','#',' ',' ',' ','#',' ',' ',' ','#','#','#','#','#',' ',' ',' ','#',' ',' ',' ','#',' ',' ',' ','#',' ','#'],
    ['#',' ','#',' ','#','#','#','#','#',' ','#',' ','#','#','#','#','#','#','#','#','#',' ','#',' ','#','#','#','#','#',' ','#',' ','#'],
    ['#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#'],
    ['#','#','#',' ','#',' ','#',' ','#',' ','#',' ','#','#','#','#','#','#','#','#','#',' ','#',' ','#',' ','#',' ','#',' ','#','#','#'],
    [' ',' ',' ',' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ',' '],
    ['#','#','#',' ','#',' ','#','#','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#','#','#',' ','#',' ','#','#','#'],
    ['#',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ','#'],
    ['#',' ','#','#','#',' ','#',' ','#',' ','#','#','#','#','#',' ','#',' ','#','#','#','#','#',' ','#',' ','#',' ','#','#','#',' ','#'],
    ['#',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ','#'],
    ['#','#','#',' ','#',' ','#','#','#',' ','#',' ','#','#','#',' ','#',' ','#','#','#',' ','#',' ','#','#','#',' ','#',' ','#','#','#'],
    ['#',' ',' ',' ','#',' ',' ',' ',' ',' ','#',' ',' ',' ','#',' ','#',' ','#',' ',' ',' ','#',' ',' ',' ',' ',' ','#',' ',' ',' ','#'],
    ['#',' ','#',' ','#','#','#','#','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#',' ','#','#','#','#','#',' ','#',' ','#'],
    ['#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' ','#'],
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#']
  ];
}
