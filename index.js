const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("newGame");
const resetScoresBtn = document.getElementById("resetScores");
const modeButtons = [...document.querySelectorAll(".pill[data-mode]")];
const symbolButtons = [...document.querySelectorAll(".pill[data-symbol]")];
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

let board, currentPlayer, gameActive, vsComputer;
let humanSymbol = "X",
  aiSymbol = "O";
let scores = { X: 0, O: 0, D: 0 };

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function initGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.setAttribute("data-idx", i);
    cell.addEventListener("click", onCellClick);
    grid.appendChild(cell);
  }
}

function startGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameActive = true;
  [...grid.children].forEach((c) => {
    c.textContent = "";
    c.classList.remove("disabled", "win");
    c.disabled = false;
  });
  updateStatus();
  if (vsComputer && aiSymbol === "X") {
    setTimeout(computerMove, 300);
  }
}

function updateStatus(msg) {
  if (msg) {
    statusEl.innerHTML = msg;
    return;
  }
  if (!gameActive) {
    return;
  }
  statusEl.innerHTML = `Turn: <strong>${currentPlayer}</strong>`;
}

function onCellClick(e) {
  const idx = +e.currentTarget.dataset.idx;
  if (!gameActive || board[idx]) return;
  if (vsComputer && currentPlayer !== humanSymbol) return;
  makeMove(idx, currentPlayer);
  const outcome = checkOutcome();
  if (outcome.done) {
    endGame(outcome);
    return;
  }
  switchTurn();
  if (vsComputer && currentPlayer === aiSymbol && gameActive) {
    setTimeout(computerMove, 280);
  }
}

function makeMove(idx, player) {
  board[idx] = player;
  const cell = grid.children[idx];
  cell.textContent = player;
  cell.classList.add("disabled");
  cell.disabled = true;
}

function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

function checkOutcome() {
  for (const line of wins) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { done: true, winner: board[a], line };
    }
  }
  if (board.every(Boolean)) return { done: true, winner: "D" };
  return { done: false };
}

function endGame({ winner, line }) {
  gameActive = false;
  if (winner === "D") {
    scores.D++;
    scoreDEl.textContent = scores.D;
    updateStatus("It's a draw.");
  } else {
    scores[winner]++;
    (winner === "X" ? scoreXEl : scoreOEl).textContent = scores[winner];
    highlightWin(line);
    updateStatus(`<strong>${winner}</strong> wins!`);
  }
  [...grid.children].forEach((c, i) => {
    if (!board[i]) {
      c.classList.add("disabled");
      c.disabled = true;
    }
  });
}

function highlightWin(line) {
  if (line) line.forEach((i) => grid.children[i].classList.add("win"));
}

function computerMove() {
  if (!gameActive) return;
  const idx = bestMove(board, aiSymbol);
  if (idx == null) return;
  makeMove(idx, aiSymbol);
  const outcome = checkOutcome();
  if (outcome.done) {
    endGame(outcome);
    return;
  }
  switchTurn();
}

function bestMove(b, player) {
  for (const i of emptyIndices(b)) {
    b[i] = player;
    if (checkWinFor(b, player)) {
      b[i] = null;
      return i;
    }
    b[i] = null;
  }
  const opp = player === "X" ? "O" : "X";
  for (const i of emptyIndices(b)) {
    b[i] = opp;
    if (checkWinFor(b, opp)) {
      b[i] = null;
      return i;
    }
    b[i] = null;
  }
  let best = { score: -Infinity, idx: null };
  for (const i of emptyIndices(b)) {
    b[i] = player;
    const score = minimax(b, false, player, 0);
    b[i] = null;
    if (score > best.score) {
      best = { score, idx: i };
    }
  }
  return best.idx;
}

function minimax(b, isMax, ai, depth) {
  const human = ai === "X" ? "O" : "X";
  if (checkWinFor(b, ai)) return 10 - depth;
  if (checkWinFor(b, human)) return depth - 10;
  if (emptyIndices(b).length === 0) return 0;

  const player = isMax ? ai : human;
  let best = isMax ? -Infinity : Infinity;

  for (const i of emptyIndices(b)) {
    b[i] = player;
    const score = minimax(b, !isMax, ai, depth + 1);
    b[i] = null;
    best = isMax ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function checkWinFor(b, p) {
  return wins.some(([a, b2, c]) => b[a] === p && b[b2] === p && b[c] === p);
}
function emptyIndices(b) {
  return b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
}

newGameBtn.addEventListener("click", startGame);
resetScoresBtn.addEventListener("click", () => {
  scores = { X: 0, O: 0, D: 0 };
  scoreXEl.textContent = 0;
  scoreOEl.textContent = 0;
  scoreDEl.textContent = 0;
  startGame();
});
modeButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    vsComputer = btn.dataset.mode === "ai";
    startGame();
  })
);
symbolButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    symbolButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    humanSymbol = btn.dataset.symbol;
    aiSymbol = humanSymbol === "X" ? "O" : "X";
    startGame();
  })
);

initGrid();
vsComputer = false;
startGame();
