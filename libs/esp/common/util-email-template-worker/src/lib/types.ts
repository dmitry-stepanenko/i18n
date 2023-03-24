export interface EmailTemplateToWorkerMessage {
  id: string;
  inputs: Record<string, string>;
  fields: string[];
  context: Record<string, unknown>;
}

export interface EmailTemplateFromWorkerMessage {
  id: string;
  outputs: Record<string, string>;
}
