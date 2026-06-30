import { ITool } from '../tools/base';
import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';
import { Tool, FunctionDeclaration } from '@google/generative-ai';

class ToolRouter {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool) {
    if (this.tools.has(tool.name)) {
      Logger.error(`Tool ${tool.name} is already registered.`);
      return;
    }
    this.tools.set(tool.name, tool);
    Logger.info(`Registered tool: ${tool.name}`);
  }

  getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  getGeminiTools(): Tool[] {
    const declarations: FunctionDeclaration[] = this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    if (declarations.length === 0) return [];

    return [{ functionDeclarations: declarations }];
  }

  async execute(name: string, args: any): Promise<any> {
    const start = Date.now();
    const tool = this.getTool(name);
    
    if (!tool) {
      const errorMsg = `Tool ${name} not found.`;
      Logger.error(errorMsg);
      return { error: errorMsg };
    }

    try {
      if (tool.requiresPermission) {
        // Import must be added to top of file
        const { permissionManager } = await import('../permissions/manager');
        const granted = await permissionManager.requestPermission(name, args);
        if (!granted) {
          Logger.info(`Permission denied for tool: ${name}`);
          return { error: `Permission denied by user for action: ${name}` };
        }
      }

      Logger.info(`Executing tool: ${name}`, args);
      const result = await tool.execute(args);
      
      const durationMs = Date.now() - start;
      Logger.metric(`Tool_${name}`, durationMs);
      eventBus.emit(SystemEvents.ToolExecuted, { name, args, result, durationMs });

      return result;
    } catch (error: any) {
      Logger.error(`Error executing tool ${name}:`, error);
      return { error: error.message };
    }
  }
}

export const toolRouter = new ToolRouter();
