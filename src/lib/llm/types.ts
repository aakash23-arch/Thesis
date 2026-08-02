export interface GenerationRequest {
  /** A system-level instruction describing the role and the output contract. */
  system: string;
  prompt: string;
  /** Low for extraction-style work where we want the same answer twice. */
  temperature?: number;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  /** Returns raw text. Parsing and validation are the caller's job. */
  generate(request: GenerationRequest): Promise<string>;
}
