export interface ExportSettings {
  fields: (string | { label: string; value: string; })[];
  unwind: string[];
  delimiter: string;
}

export interface Config {
  urlCore: string,
  urlMap: string,
  excludeURL: RegExp,
  resultPath?: string;
  exportSettings: ExportSettings;
}
