import chalk from "chalk";
import Table from "cli-table";

export class Grid {
  cells: number[][];
  size: number;
  cellWidth: number;

  constructor() {
    this.size = Number(process.env.SIZE);
    this.cellWidth = 10;
    this.cells = this.initializeGrid();
  }

  initializeGrid(): number[][] {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      const row: number[] = cells[x] = [];
      for (let y = 0; y < this.size; y++) {
        row.push(0);
      }
    }
    return cells;
  }

  drawCells(): string {
    const cells = JSON.parse(JSON.stringify(this.cells));
    const size = this.size;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        cells[x][y] = cells[x][y] ? cells[x][y] : "";
        cells[x][y] = this.trimCell(cells[x][y]) + this.cellColor(cells[x][y]);
      }
    }
    const cellWidthArray: number[] = [];
    for (let index = 0; index < this.size; index++) {
      cellWidthArray.push(this.cellWidth);
    }
    const table = new Table({
      colWidths: cellWidthArray,
    });
    table.push(...cells);
    return table.toString();
  }

  cellColor(value: {
    "2": string;
    "4": string;
    "8": string;
    "16": string;
    "32": string;
    "64": string;
    "128": string;
    "256": string;
    "512": string;
    "1024": string;
    "2048": string;
    "4096": string;
  }): string {
    if (!value) return value;
    const colorMap = {
      "2": "#B47EB3",
      "4": "#FDF5BF",
      "8": "#FF3C38",
      "16": "#92D1C3 ",
      "32": "#FEE440",
      "64": "#00F5D4",
      "128": "#218380",
      "256": "#FBB13C",
      "512": "#FFF275",
      "1024": "#EAF6FF",
      "2048": "#23CE6B",
      "4096": "#A39BA8",
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return chalk.hex([colorMap[value]])(value);
  }

  trimCell(value: number): string {
    const length = (this.cellWidth - 4) / 2 + 4 - (value + "").length;
    return new Array(length + 1).join(" ");
  }

  setCellValue(x: number, y: number, value: number): void {
    this.cells[x][y] = value;
  }

  availableCell(): {
    x: number;
    y: number;
  }[] {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (!this.cells[x][y]) {
          cells.push({
            x,
            y,
          });
        }
      }
    }
    return cells;
  }
}
