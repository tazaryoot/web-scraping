import { FunctionType } from './function-type';

interface Preset {
  barCompleteChar: string;
  barIncompleteChar: string;
  format: string;
  shades_classic: string,
}

interface Presets {
  legacy: Preset;
  rect: Preset;
  shades_classic: Preset;
  shades_grey: Preset;
}

export interface CliProgressBar {
  stop: FunctionType,
}

export interface CliProgress {
  Bar: (arg0: unknown, arg1: Preset) => CliProgressBar,
  Presets: Presets,
}
