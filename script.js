// Game State Variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameMode = "pvp";
let aiDifficulty = "easy";
let scores = { X: 0, O: 0, draws: 0 }; // Track wins and draws

// Select AI Difficulty
function selectAIDifficulty() {
    document.getElementById("difficulty").style.display = "block";
}

// Start Game
function startGame(mode, difficulty = "easy") {
    gameMode = mode;
    aiDifficulty = difficulty;
    document.getElementById("difficulty").style.display = "none";
    createBoard();
}

// Create Game Board
function createBoard() {
    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    document.getElementById("status").innerText = "Game Started!";
    board.forEach((cell, index) => {
        let div = document.createElement("div");
        div.classList.add("cell");
        div.setAttribute("data-index", index);
        div.addEventListener("click", handleMove);
        boardDiv.appendChild(div);
    });
}

// Handle Player Move
function handleMove(event) {
    let index = event.target.getAttribute("data-index");
    if (board[index] === "") {
        board[index] = currentPlayer;
        event.target.innerText = currentPlayer;
        event.target.classList.add("taken");
        if (checkWin()) {
            document.getElementById("status").innerText = `🎉 Player ${currentPlayer} wins!`;
            updateScore(currentPlayer);
            return;
        }
        if (board.every(cell => cell !== "")) {
            document.getElementById("status").innerText = "🤝 It's a draw!";
            updateScore("draws");
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        if (gameMode === "ai" && currentPlayer === "O") {
            setTimeout(aiMove, 500);
        }
    }
}

// AI Move Logic
function aiMove() {
    let move;
    if (aiDifficulty === "easy") {
        let available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        move = available[Math.floor(Math.random() * available.length)];
    } else if (aiDifficulty === "medium") {
        move = findBlockingMove();
        if (move === null) {
            let available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
            move = available[Math.floor(Math.random() * available.length)];
        }
    } else {
        move = minimax(board, "O").index;
    }
    board[move] = "O";
    document.querySelector(`[data-index='${move}']`).innerText = "O";
    document.querySelector(`[data-index='${move}']`).classList.add("taken");
    if (checkWin()) {
        document.getElementById("status").innerText = "🤖 AI Wins!";
        updateScore("O");
        return;
    }
    currentPlayer = "X";
}

// Find Blocking Move (Medium AI)
function findBlockingMove() {
    let winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let pattern of winPatterns) {
        let xCount = pattern.filter(i => board[i] === "X").length;
        let empty = pattern.find(i => board[i] === "");
        if (xCount === 2 && empty !== undefined) return empty;
    }
    return null;
}

// Minimax Algorithm for Hard AI
function minimax(newBoard, player) {
    let available = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (checkWinAI(newBoard, "X")) return { score: -10 };
    if (checkWinAI(newBoard, "O")) return { score: 10 };
    if (available.length === 0) return { score: 0 };

    let moves = available.map(index => {
        let move = { index };
        newBoard[index] = player;
        let result = minimax(newBoard, player === "O" ? "X" : "O");
        move.score = result.score;
        newBoard[index] = "";
        return move;
    });

    return player === "O"
        ? moves.reduce((best, m) => m.score > best.score ? m : best, { score: -Infinity })
        : moves.reduce((best, m) => m.score < best.score ? m : best, { score: Infinity });
}

// Highlight winning cells
function highlightWinningCells(winningPattern) {
    winningPattern.forEach(index => {
        document.querySelector(`[data-index='${index}']`).classList.add("winning-cell");
    });
}

// Modified checkWin function to highlight winners
function checkWin() {
    let winningPattern = checkWinAI(board, currentPlayer);
    if (winningPattern) {
        highlightWinningCells(winningPattern);
        return true;
    }
    return false;
}

// Updated checkWinAI to return winning pattern
function checkWinAI(boardState, player) {
    let winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let pattern of winPatterns) {
        if (pattern.every(i => boardState[i] === player)) {
            return pattern; // Return winning pattern
        }
    }
    return null;
}

// Update Scoreboard
function updateScore(winner) {
    if (winner === "X") scores.X++;
    else if (winner === "O") scores.O++;
    else scores.draws++;

    document.getElementById("playerScore").innerText = scores.X;
    document.getElementById("aiScore").innerText = scores.O;
    document.getElementById("drawScore").innerText = scores.draws;
}

// Restart Game
function resetGame() {
    startGame(gameMode, aiDifficulty);
}

// Toggle Dark Mode
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}
