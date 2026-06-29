import { SchemaType } from '@google/generative-ai';
import { ITool } from '../base';

export const calculatorTool: ITool = {
  name: "calculate",
  description: "Evaluate a mathematical expression and return the result. Use this for math questions.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      expression: {
        type: SchemaType.STRING,
        description: "The mathematical expression to evaluate (e.g., '2 + 2', '5 * 10')",
      },
    },
    required: ["expression"],
  },
  requiresPermission: false,
  execute: async (args: { expression: string }) => {
    try {
      // Very simple evaluator for demo purposes. In production use a math parser library.
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${args.expression}`)();
      return `The result is ${result}`;
    } catch (err: any) {
      return `Error calculating expression: ${err.message}`;
    }
  }
};
