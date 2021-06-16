/* eslint-disable @typescript-eslint/ban-ts-comment */
import { config } from "dotenv";
import readline from "readline";
import { oldData } from "./db";
import { Game } from "./game";

const game = new Game(oldData.lastScore, oldData.highestScore);

const width = process.stdout.columns;
const height = process.stdout.rows;

config();
// Currently supported keys - WASD, 1234, UP DOWN LEFT RIGHT
const keyMap = {
  "31": "up", // 1
  "32": "left", // 2
  "33": "down", // 3
  "34": "right", // 4
  "77": "up", // W
  "61": "left", // A
  "73": "down", // S
  "64": "right", // D
  "1b5b41": "up", // UP
  "1b5b44": "left", // LEFT
  "1b5b42": "down", // DOWN
  "1b5b43": "right", // RIGHT
};

// Interface to read the key pressess using native readline module
const ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

ReadLine.prompt();

// @ts-ignore
ReadLine.input.on("data", (chunk: "77") => {
  // @ts-ignore
  const direction: "up" | "down" | "left" | "right" = keyMap[chunk.toString("hex")];
  if (direction) {
    process.stdout.write("\u001B[2J\u001B[0;0f");
    game.moveTheTile(direction);
  }
});

ReadLine.on("close", () => {
  console.log(`Bye, see you soon!\n`);
  game.stopTheGame();
});

if (width > 180 && height > 30) {
  console.clear();
  game.startTheGame();
} else {
  console.log("To use it, Please open the game in bigger terminal window");
  process.exit(0);
}
