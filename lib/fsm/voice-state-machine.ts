export type VoiceState = 
  | "idle" 
  | "wake_listening" 
  | "wake_detected" 
  | "recording" 
  | "transcribing" 
  | "planning" 
  | "executing" 
  | "generating_response" 
  | "speaking" 
  | "recovering" 
  | "error";

export type StateChangeListener = (newState: VoiceState, previousState: VoiceState) => void;

export class VoiceStateMachine {
  private currentState: VoiceState = "idle";
  private listeners: Set<StateChangeListener> = new Set();

  constructor(initialState: VoiceState = "idle") {
    this.currentState = initialState;
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public transitionTo(newState: VoiceState): boolean {
    if (this.currentState === newState) {
      return false; // No change
    }

    const prevState = this.currentState;
    this.currentState = newState;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(newState, prevState));
    return true;
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public is(state: VoiceState | VoiceState[]): boolean {
    if (Array.isArray(state)) {
      return state.includes(this.currentState);
    }
    return this.currentState === state;
  }
}
