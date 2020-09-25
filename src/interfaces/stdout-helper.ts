export type Direction = -1 | 0 | 1;


export interface StdoutHelper {
  clearLine(dir?: Direction): void;
}
