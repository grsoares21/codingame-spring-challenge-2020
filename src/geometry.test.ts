import { findPath } from "./geometry";

it(`should get shortest past with A*`, () => {
  expect(findPath(getMap(), { x: 0, y: 0 }, { x: 4, y: 3 })).toMatchSnapshot();
});

it(`should get shortest past with A* with pac in the way`, () => {
  let map = getMap();
  map[1][3] = "#";
  expect(findPath(map, { x: 0, y: 0 }, { x: 4, y: 3 })).toMatchSnapshot();
});

function getMap(): string[][] {
  return [
    [" ", " ", " ", " ", " "],
    [" ", "#", "#", " ", "#"],
    [" ", "#", "#", " ", "#"],
    [" ", " ", "#", " ", " "],
    ["#", " ", " ", " ", " "],
  ];
}
