export const ROWS = 20;
export const COLS = 10;
export const BLOCK_SIZE = 30; // Keep this static for simplicity in this version

export const SHAPES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'cyan',
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: 'orange',
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: 'blue',
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: 'purple',
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: 'yellow',
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: 'green',
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: 'red',
  },
};

export const PIECE_KEYS = Object.keys(SHAPES);

export const EMPTY_COLOR = '#1A1A2E'; // Dark background for empty cells
export const BORDER_COLOR = '#4A4E69'; // Border color for blocks

export const INITIAL_DROP_INTERVAL = 1000; // ms
export const FAST_DROP_INTERVAL = 50; // ms

export const POINTS_PER_LINE = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const WIN_SCORE_DEFAULT = 1000; // Default win score if not provided