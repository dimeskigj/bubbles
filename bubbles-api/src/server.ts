import { Server, Origins } from "boardgame.io/server";
import { TicTacToe } from "./games/tic-tac-toe";
import { BubblesGame } from "./games/bubbles";

const server = Server({
  games: [BubblesGame, TicTacToe],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
