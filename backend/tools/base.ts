import { FunctionDeclaration } from "@google/generative-ai";

export interface ITool {
  name: string;
  description: string;
  parameters: FunctionDeclaration['parameters'];
  requiresPermission: boolean;
  execute: (args: any) => Promise<any>;
}
