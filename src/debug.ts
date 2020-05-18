export const runLocally = (filePath: string) => {
  let replay = require("fs")
    .readFileSync(filePath, "utf8")
    .trim()
    .split("\n")
    .filter((line: string) => line.startsWith("[in] "))
    .map((line: string) => line.substr(5))
    .reverse();

  global.readline = function () {
    let line = replay.pop();
    if (!line) {
      process.exit(1);
    }
    return line;
  };
};

export const storeInput = () => {
  const readlinebackup = readline;
  global.readline = function () {
    const line = readlinebackup();
    console.error("[in]", line);
    return line;
  };
};

export function prettyPrintNumberMatrix(matrix: number[][]): string {
  return matrix
    .map((line) =>
      line
        .map((num) => num / 10)
        .map((num) => (num >= 0 ? "+" + num.toFixed(2) : num.toFixed(2)))
        .map((num) => (num === "-Infinity" ? "#####" : num))
        .join(" ")
    )
    .join("\n");
}
