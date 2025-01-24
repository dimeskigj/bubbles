import { Server, Origins } from "boardgame.io/server";
import { TicTacToe } from "./games/tic-tac-toe";
import { Bubbles } from "./games/bubbles";

const server = Server({
  games: [Bubbles, TicTacToe],
  origins: [Origins.LOCALHOST, "https://bubbles.dimeski.net"],
});

server.run(8000);
