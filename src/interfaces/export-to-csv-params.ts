interface Field {
  label: string;
  value: string;
}

export interface ExportToCsvParams {
  path?: string;
  fields?: Array<string | Field>;
  unwind?: string[];
  delimiter?: string;
}
