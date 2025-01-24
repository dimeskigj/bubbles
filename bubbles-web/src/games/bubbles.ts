import type { Game, Move } from "boardgame.io";
import { Bubble, BubbleType } from "./models/bubble";
import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random";

interface PlayerScore {
  playerId: string;
  score: number;
}

export interface BubblesState {
  board: Bubble[][];
  scores: PlayerScore[];
}

const tapBubble: Move<BubblesState> = ({ G, playerID, random }) => {
  let playerScore = G.scores.find((s) => s.playerId === playerID);

  if (!playerScore) {
    playerScore = { playerId: playerID, score: 0 };
    G.scores.push(playerScore);
  }

  // TODO:
  playerScore.playerId += 1;
  G.board = generateBoard(10, 6, random);
};

export const Bubbles: Game<BubblesState> = {
  name: "bubbles",
  setup: ({ random }) => ({
    board: generateBoard(10, 6, random),
    scores: [],
  }),
  moves: {
    tapBubble,
  },
  maxPlayers: 2,
  minPlayers: 2,
  disableUndo: true,
};

const generateBoard = (
  rows: number,
  cols: number,
  random: RandomAPI
): Bubble[][] => {
  const matrix: Bubble[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: Bubble[] = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        id: random.Number().toString(),
        type: random.Die(3) as BubbleType,
      });
    }
    matrix.push(row);
  }

  return matrix;
};
