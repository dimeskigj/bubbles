import type { Game, Move } from "boardgame.io";
import { Bubble, BubblesState, BubbleType } from "./models/bubble";
import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random";

const tapBubble: Move<BubblesState> = (
  { G, ctx, events, playerID, random },
  row: number,
  column: number
) => {
  const playerScore = G.scores.find((s) => s.playerId === playerID)!;

  // TODO: fix this
  playerScore.score += 1;
  G.board = generateBoard(10, 8, random);

  if (ctx.turn >= 4) {
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
