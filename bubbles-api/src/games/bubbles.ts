import type { Game, Move } from "boardgame.io";
import { BubblesState } from "./models/bubble";
import { generateBoard, updateBoardAndScore } from "./utils";

const MAX_TURNS = 10;

const tapBubble: Move<BubblesState> = (
  { G, ctx, events, playerID, random },
  row: number,
  column: number
) => {
  updateBoardAndScore(row, column, playerID, random, G);

  if (ctx.turn >= MAX_TURNS * 2) {
    events.endGame();
  } else {
    events.endTurn();
  }
};

export const Bubbles: Game<BubblesState> = {
  name: "bubbles",
  setup: ({ random }) => ({
    board: generateBoard(10, 8, random),
    scores: [
      { playerId: "0", score: 0 },
      { playerId: "1", score: 0 },
    ],
  }),
  moves: {
    tapBubble,
  },
  ai: {
    enumerate: (G, ctx) => {
      let moves = [];
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 8; j++)
          moves.push({ move: "tapBubble", args: [i, j] });
      }
      return moves;
    },
  },
  maxPlayers: 2,
  minPlayers: 2,
  disableUndo: true,
};
