import type { Game, Move } from "boardgame.io";

const clickCellMove: Move<TicTacToeState> = ({ G, playerID }, id: number) => {
  G.cells[id] = playerID;
};

export const TicTacToe: Game = {
  name: "tic-tac-toe",
  setup: () => ({ cells: Array(9).fill(null) }),
  moves: {
    clickCell: clickCellMove,
  },
};

export interface TicTacToeState {
  cells: string[];
}
