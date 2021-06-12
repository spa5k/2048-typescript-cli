import chalk from "chalk";
import Table from "cli-table";
import { db } from "./db";
import { Grid } from "./grid";

export class Game {
  // Total score
  score: number;
  // The number of step
  step: number;
  // To check whether the condition for loss or win has changed
  hasChange: boolean;
  // To check if its won
  isWon: boolean;
  // Type of Grid for grid
  grid: Grid;
  lastScore: number;
  higestScore: number;

  constructor(lastScore = 0, highestScore = 0) {
    this.score = 0;
    this.step = 0;
    this.hasChange = false;
    this.isWon = false;
    this.lastScore = lastScore, this.higestScore = highestScore;
  }

  startTheGame(): void {
    // Initializing new grid;
    this.grid = new Grid();
    const initialNumbers = Number(process.env.INITIAL_NUMBERS);
    // Number of initial numbers to be added.
    for (let index = 0; index < initialNumbers; index++) {
      this.randomNumberGenerator();
    }
    this.action();
  }

  // Draw the grid
  drawGrid(): string {
    return this.grid.drawCells();
  }

  // Moving the direction
  moveIt(direction: "up" | "down" | "left" | "right"): void {
    switch (direction) {
      case "up":
        this.tileUp();
        break;
      case "down":
        this.tileDown();
        break;
      case "left":
        this.rangeTilesLeft();
        break;
      case "right":
        this.tileVal();
        break;
      default:
        break;
    }
  }

  tileUp(): void {
    const cells = this.grid.cells;
    const size = this.grid.size;
    for (let y = 0; y < size; y++) {
      let cellCol = [];
      for (let x = 0; x < size; x++) {
        cellCol.push(cells[x][y]);
      }
      cellCol = this.rowVal(cellCol);
      for (let x = 0; x < size; x++) {
        cells[x][y] = cellCol[x];
      }
    }

    this.action();
  }

  tileDown(): void {
    const cells = this.grid.cells;
    const size = this.grid.size;
    for (let y = 0; y < size; y++) {
      let cellCol = [];
      for (let x = 0; x < size; x++) {
        cellCol.push(cells[x][y]);
      }
      cellCol = this.rowVal(cellCol.reverse()).reverse();
      for (let x = 0; x < size; x++) {
        cells[x][y] = cellCol[x];
      }
    }
    this.action();
  }

  rangeTilesLeft(): void {
    const cells = this.grid.cells,
      size = this.grid.size;
    for (let x = 0; x < size; x++) {
      cells[x] = this.rowVal(cells[x]);
    }
    this.action();
  }

  tileVal(): void {
    const cells = this.grid.cells,
      size = this.grid.size;
    for (let x = 0; x < size; x++) {
      cells[x] = this.rowVal(cells[x].reverse()).reverse();
    }
    this.action();
  }

  // Draw the info board
  drawBoard(): string {
    const board = [
      ["Score", this.score],
      ["Steps", this.step],
      ["Highest Score", this.higestScore],
      ["Last Score", this.lastScore],
    ];
    const table = new Table({
      colWidths: [21, 21],
    });
    table.push(...board);
    return table.toString();
  }

  // Draw the help section
  drawHelp(): string {
    return `1 or ↑ or W -> Up
    \n2 or ← or A -> Left
    \n3 or ↓ or S -> Down
    \n4 or → or D -> Right
    \nPlease press a key.\n`;
  }

  // Generate the random number that should be added.
  randomNumberGenerator(): void {
    const cells = this.grid.availableCell();
    if (cells.length) {
      const randomCell = cells[Math.floor(Math.random() * cells.length)];
      const value = this.randomValue();
      this.grid.setCellValue(randomCell.x, randomCell.y, value);
    }
  }

  randomValue(): 2 | 4 {
    return Math.random() < 0.9 ? 2 : 4;
  }

  rowVal(arr: number[]): number[] {
    let next;
    for (let i = 0; i < arr.length; i++) {
      next = arr.findIndex((c, m) => {
        return m > i && c !== 0;
      });
      if (next !== -1) {
        if (arr[i] === 0) {
          arr[i] = arr[next];
          arr[next] = 0;
          i -= 1;
          this.hasChange = true;
        } else if (arr[i] === arr[next]) {
          arr[i] = arr[i] * 2;
          arr[next] = 0;
          this.setScore(arr[i]);
          this.hasChange = true;
        }
      }
    }
    return arr;
  }

  // Update the last score in DB and similar things
  updateScoreInfo(): void {
    if (this.higestScore < this.score) {
      this.higestScore = this.score;
    }
    db.push("/", {
      lastScore: this.score,
      highestScore: this.higestScore < this.score ? this.score : this.higestScore,
    });
  }

  // Action that is done on every keypress
  action(): void {
    if (this.hasChange) {
      this.randomNumberGenerator();
      this.changeStepCount();
      this.updateScoreInfo();
    }
    console.log(chalk.yellow(this.drawGrid()));
    console.log(chalk.cyan(this.drawBoard()) + "\n");
    console.log(chalk.bold(this.drawHelp()));

    if (this.hasChange) {
      this.hasChange = false;
      if (this.isWon) this.youWon();
      if (this.checkLose()) this.youLost();
    }
  }

  // Updating the score
  setScore(score: number): void {
    this.score += score;
    // Final score, change env to change it.
    if (score === Number(process.env.FINAL_SCORE)) {
      this.isWon = true;
    }
  }

  // Update the number of geuine keypress
  changeStepCount(): void {
    this.step += 1;
  }

  // Check if you lost
  checkLose(): boolean {
    const cells = this.grid.cells;
    const size = this.grid.size;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (cells[x][y] === 0) {
          return false;
        } else if (cells[x][y - 1] && cells[x][y - 1] === cells[x][y]) {
          return false;
        } else if (cells[x - 1] && cells[x - 1][y] === cells[x][y]) {
          return false;
        }
      }
    }
    return true;
  }

  // command to send if you win
  youWon(): void {
    const str = `🌟 Noice, you won!\n`;
    console.log(chalk.blue(str));
    this.stopTheGame();
  }

  youLost(): void {
    const str = `😭 Goddamn, What a loser you are!\n`;
    console.log(chalk.red(str));
    this.stopTheGame();
  }

  stopTheGame(): void {
    process.exit(0);
  }
}
