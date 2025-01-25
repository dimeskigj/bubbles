export interface Bubble {
  id: string;
  type: BubbleType;
}

export enum BubbleType {
  Cyan = 1,
  Magenta = 2,
  Yellow = 3,
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

export interface BubblesState {
  board: Bubble[][];
  scores: PlayerScore[];
}
