export interface ProgressBar {
  start(total: number): void;
  setTotal(total: number): void;
  update(additionalTotal: number): void;
  update(val?: number): void;
  stop(): void;
}
