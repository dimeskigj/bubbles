import { RandomAPI } from "boardgame.io/dist/types/src/plugins/random/random";
import { Bubble, BubblesState, BubbleType } from "./models/bubble";

export const generateBoard = (
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

export const updateBoardAndScore = (
  row: number,
  column: number,
  playerId: string,
  random: RandomAPI,
  G: BubblesState
): void => {
  const playerScore = G.scores.find((s) => s.playerId === playerId)!;
  const board = G.board;
  const targetBubble = board[row]?.[column];

  if (!targetBubble) {
    return;
  }

  const typeToPop = targetBubble.type;
  const visited = new Set<string>();
  let bubblesPopped = 0;

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const isValid = (r: number, c: number) =>
    r >= 0 && r < board.length && c >= 0 && c < board[0].length;

  const dfs = (r: number, c: number) => {
    if (!isValid(r, c)) return;
    const key = `${r},${c}`;
    if (visited.has(key) || board[r][c]?.type !== typeToPop) return;

    visited.add(key);
    bubblesPopped++;

    board[r][c] = null;

    for (const [dr, dc] of directions) {
      dfs(r + dr, c + dc);
    }
  };

  dfs(row, column);

  playerScore.score += bubblesPopped * bubblesPopped;

  for (let col = 0; col < board[0].length; col++) {
    let emptyRow = board.length - 1;
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        if (row !== emptyRow) {
          board[emptyRow][col] = board[row][col];
          board[row][col] = null;
        }
        emptyRow--;
      }
    }

    for (let row = emptyRow; row >= 0; row--) {
      board[row][col] = {
        id: random.Number().toString(),
        type: random.Die(3) as BubbleType,
      };
    }
  }
};
