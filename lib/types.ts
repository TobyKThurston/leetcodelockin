export interface SolveResponse {
  hints: string[];
  pattern: string;
  steps: string[];
  code: string;
}

export interface SolveRequest {
  problem: string;
  attempt?: string;
}
