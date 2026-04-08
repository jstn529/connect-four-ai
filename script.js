const ROWS = 6;
const COLS = 7;
const HUMAN = 1;
const AI = 2;
const EMPTY = 0;

let board = [];
let gameOver = false;
let currentPlayer = HUMAN;

const boardEl = document.getElementById("board");
const columnButtonsEl = document.getElementById("columnButtons");
const statusEl = document.getElementById("status");
const detailsEl = document.getElementById("details");
const restartBtn = document.getElementById("restartBtn");
const aiFirstBtn = document.getElementById("aiFirstBtn");

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function initGame() {
  board = createEmptyBoard();
  gameOver = false;
  currentPlayer = HUMAN;
  renderColumnButtons();
  renderBoard();
  updateStatus("Your turn", "Click a column to drop your piece.");
}

function renderColumnButtons() {
  columnButtonsEl.innerHTML = "";
  for (let col = 0; col < COLS; col++) {
    const btn = document.createElement("div");
    btn.className = "column-btn";
    btn.textContent = "▼";
    btn.addEventListener("click", () => handleHumanMove(col));
    columnButtonsEl.appendChild(btn);
  }
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (board[r][c] === HUMAN) cell.classList.add("red");
      if (board[r][c] === AI) cell.classList.add("yellow");
      boardEl.appendChild(cell);
    }
  }
}

function updateStatus(title, details) {
  statusEl.textContent = title;
  detailsEl.textContent = details;
}

function getAvailableRow(tempBoard, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (tempBoard[r][col] === EMPTY) return r;
  }
  return -1;
}

function dropPiece(tempBoard, row, col, player) {
  tempBoard[row][col] = player;
}

function isValidMove(tempBoard, col) {
  return tempBoard[0][col] === EMPTY;
}

function getValidMoves(tempBoard) {
  const valid = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidMove(tempBoard, col)) valid.push(col);
  }
  return valid;
}

function handleHumanMove(col) {
  if (gameOver || currentPlayer !== HUMAN) return;
  if (!isValidMove(board, col)) return;

  const row = getAvailableRow(board, col);
  dropPiece(board, row, col, HUMAN);
  renderBoard();

  if (winningMove(board, HUMAN)) {
    gameOver = true;
    updateStatus("You win!", "Nice job — you beat the AI.");
    return;
  }

  if (isBoardFull(board)) {
    gameOver = true;
    updateStatus("Draw game", "Nobody wins this round.");
    return;
  }

  currentPlayer = AI;
  updateStatus("AI thinking...", "The AI is choosing a move.");

  setTimeout(() => {
    aiMove();
  }, 500);
}

function aiMove() {
  if (gameOver) return;

  const col = getBestMove(board, 4);
  const row = getAvailableRow(board, col);
  dropPiece(board, row, col, AI);
  renderBoard();

  if (winningMove(board, AI)) {
    gameOver = true;
    updateStatus("AI wins!", "The AI connected four.");
    return;
  }

  if (isBoardFull(board)) {
    gameOver = true;
    updateStatus("Draw game", "Nobody wins this round.");
    return;
  }

  currentPlayer = HUMAN;
  updateStatus("Your turn", "Click a column to drop your piece.");
}

function isBoardFull(tempBoard) {
  return getValidMoves(tempBoard).length === 0;
}

function winningMove(tempBoard, player) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        tempBoard[r][c] === player &&
        tempBoard[r][c + 1] === player &&
        tempBoard[r][c + 2] === player &&
        tempBoard[r][c + 3] === player
      ) {
        return true;
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        tempBoard[r][c] === player &&
        tempBoard[r + 1][c] === player &&
        tempBoard[r + 2][c] === player &&
        tempBoard[r + 3][c] === player
      ) {
        return true;
      }
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        tempBoard[r][c] === player &&
        tempBoard[r + 1][c + 1] === player &&
        tempBoard[r + 2][c + 2] === player &&
        tempBoard[r + 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        tempBoard[r][c] === player &&
        tempBoard[r - 1][c + 1] === player &&
        tempBoard[r - 2][c + 2] === player &&
        tempBoard[r - 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  return false;
}

function evaluateWindow(window, player) {
  const opponent = player === HUMAN ? AI : HUMAN;
  let score = 0;

  const playerCount = window.filter(v => v === player).length;
  const emptyCount = window.filter(v => v === EMPTY).length;
  const opponentCount = window.filter(v => v === opponent).length;

  if (playerCount === 4) score += 100;
  else if (playerCount === 3 && emptyCount === 1) score += 10;
  else if (playerCount === 2 && emptyCount === 2) score += 4;

  if (opponentCount === 3 && emptyCount === 1) score -= 12;
  if (opponentCount === 4) score -= 100;

  return score;
}

function scorePosition(tempBoard, player) {
  let score = 0;

  const centerCol = Math.floor(COLS / 2);
  const centerArray = [];
  for (let r = 0; r < ROWS; r++) {
    centerArray.push(tempBoard[r][centerCol]);
  }
  const centerCount = centerArray.filter(v => v === player).length;
  score += centerCount * 6;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        tempBoard[r][c],
        tempBoard[r][c + 1],
        tempBoard[r][c + 2],
        tempBoard[r][c + 3]
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [
        tempBoard[r][c],
        tempBoard[r + 1][c],
        tempBoard[r + 2][c],
        tempBoard[r + 3][c]
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        tempBoard[r][c],
        tempBoard[r + 1][c + 1],
        tempBoard[r + 2][c + 2],
        tempBoard[r + 3][c + 3]
      ];
      score += evaluateWindow(window, player);
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [
        tempBoard[r][c],
        tempBoard[r - 1][c + 1],
        tempBoard[r - 2][c + 2],
        tempBoard[r - 3][c + 3]
      ];
      score += evaluateWindow(window, player);
    }
  }

  return score;
}

function cloneBoard(tempBoard) {
  return tempBoard.map(row => [...row]);
}

function isTerminalNode(tempBoard) {
  return winningMove(tempBoard, HUMAN) || winningMove(tempBoard, AI) || isBoardFull(tempBoard);
}

function minimax(tempBoard, depth, alpha, beta, maximizingPlayer) {
  const validMoves = getValidMoves(tempBoard);
  const terminal = isTerminalNode(tempBoard);

  if (depth === 0 || terminal) {
    if (terminal) {
      if (winningMove(tempBoard, AI)) {
        return { col: null, score: 1000000 };
      } else if (winningMove(tempBoard, HUMAN)) {
        return { col: null, score: -1000000 };
      } else {
        return { col: null, score: 0 };
      }
    } else {
      return { col: null, score: scorePosition(tempBoard, AI) };
    }
  }

  if (maximizingPlayer) {
    let value = -Infinity;
    let chosenCol = validMoves[Math.floor(Math.random() * validMoves.length)];

    for (const col of validMoves) {
      const row = getAvailableRow(tempBoard, col);
      const copy = cloneBoard(tempBoard);
      dropPiece(copy, row, col, AI);

      const newScore = minimax(copy, depth - 1, alpha, beta, false).score;
      if (newScore > value) {
        value = newScore;
        chosenCol = col;
      }

      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }

    return { col: chosenCol, score: value };
  } else {
    let value = Infinity;
    let chosenCol = validMoves[Math.floor(Math.random() * validMoves.length)];

    for (const col of validMoves) {
      const row = getAvailableRow(tempBoard, col);
      const copy = cloneBoard(tempBoard);
      dropPiece(copy, row, col, HUMAN);

      const newScore = minimax(copy, depth - 1, alpha, beta, true).score;
      if (newScore < value) {
        value = newScore;
        chosenCol = col;
      }

      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }

    return { col: chosenCol, score: value };
  }
}

function getBestMove(tempBoard, depth) {
  const validMoves = getValidMoves(tempBoard);

  for (const col of validMoves) {
    const row = getAvailableRow(tempBoard, col);
    const copy = cloneBoard(tempBoard);
    dropPiece(copy, row, col, AI);
    if (winningMove(copy, AI)) return col;
  }

  for (const col of validMoves) {
    const row = getAvailableRow(tempBoard, col);
    const copy = cloneBoard(tempBoard);
    dropPiece(copy, row, col, HUMAN);
    if (winningMove(copy, HUMAN)) return col;
  }

  return minimax(tempBoard, depth, -Infinity, Infinity, true).col;
}

restartBtn.addEventListener("click", initGame);

aiFirstBtn.addEventListener("click", () => {
  initGame();
  currentPlayer = AI;
  updateStatus("AI thinking...", "The AI is making the first move.");
  setTimeout(() => {
    aiMove();
  }, 500);
});

initGame();