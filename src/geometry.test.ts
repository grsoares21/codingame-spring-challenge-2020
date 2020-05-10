import { findPath } from "./geometry";

it(`should get shortest past with A*`, () => {
  expect(
    findPath(getMap(), [], { x: 0, y: 0 }, { x: 4, y: 3 })
  ).toMatchSnapshot();
});

it(`should get shortest past with A* with pac in the way`, () => {
  expect(
    findPath(getMap(), [{ x: 3, y: 1 }], { x: 0, y: 0 }, { x: 4, y: 3 })
  ).toMatchSnapshot();
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
