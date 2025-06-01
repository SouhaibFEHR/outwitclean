import { ROWS, COLS, SHAPES, PIECE_KEYS } from './tetrisConstants.js';

export const createEmptyBoard = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

export const getRandomPiece = () => {
  const type = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  const pieceData = SHAPES[type];
  return {
    shape: pieceData.shape,
    color: pieceData.color,
    x: Math.floor(COLS / 2) - Math.floor(pieceData.shape[0].length / 2),
    y: 0,
    type,
  };
};

export const isValidMove = (piece, board) => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x;
        const newY = piece.y + y;
        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && board[newY] && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export const rotatePiece = (piece) => {
  const newShape = piece.shape[0].map((_, colIndex) =>
    piece.shape.map(row => row[colIndex]).reverse()
  );
  return { ...piece, shape: newShape };
};

export const mergePieceToBoard = (piece, board) => {
  const newBoard = board.map(row => [...row]);
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    });
  });
  return newBoard;
};

export const clearLines = (board) => {
  let newBoard = board.filter(row => row.some(cell => cell === 0));
  const linesCleared = ROWS - newBoard.length;
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(0));
  }
  return { board: newBoard, linesCleared };
};
