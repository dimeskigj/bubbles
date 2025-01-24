import { Server, Origins } from "boardgame.io/server";
import { TicTacToe } from "./games/tic-tac-toe";

const server = Server({
  games: [TicTacToe],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
