const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

const CELL_SIZE = 20;
const CELLS_COUNT = canvas.width / CELL_SIZE;
const MOVE_INTERVAL = 150;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameOver = false;
let lastMoveTime = 0;
let animationId = null;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    lastMoveTime = 0;

    scoreEl.textContent = "0";
    overlay.classList.add("hidden");

    spawnApple();
    draw();
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    animationId = requestAnimationFrame(gameLoop);
}

function spawnApple() {
    let freeCells = [];
    for (let x = 0; x < CELLS_COUNT; x++) {
        for (let y = 0; y < CELLS_COUNT; y++) {
            let occupied = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === x && snake[i].y === y) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) {
                freeCells.push({ x: x, y: y });
            }
        }
    }
    if (freeCells.length === 0) {
        return;
    }
    const randomIndex = Math.floor(Math.random() * freeCells.length);
    apple = freeCells[randomIndex];
}

function moveSnake() {
    direction = nextDirection;

    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    snake.unshift(newHead);

    if (newHead.x === apple.x && newHead.y === apple.y) {
        score = score + 1;
        scoreEl.textContent = score;
        spawnApple();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= CELLS_COUNT || head.y < 0 || head.y >= CELLS_COUNT) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function update() {
    if (gameOver) {
        return;
    }

    if (checkCollision()) {
        endGame();
        return;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawApple();
    drawSnake();
}

function drawGrid() {
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= CELLS_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawApple() {
    const cx = apple.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = apple.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2 - 2;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fill();
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const x = seg.x * CELL_SIZE;
        const y = seg.y * CELL_SIZE;

        const padding = 2;
        const radius = 6;

        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2, radius);

        if (i === 0) {
            ctx.fillStyle = "#059669";
            ctx.shadowColor = "rgba(5, 150, 105, 0.5)";
            ctx.shadowBlur = 12;
        } else {
            const gradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
            gradient.addColorStop(0, "#10b981");
            gradient.addColorStop(1, "#34d399");
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawEyes();
}

function drawEyes() {
    const head = snake[0];
    const x = head.x * CELL_SIZE;
    const y = head.y * CELL_SIZE;
    const eyeSize = 3;
    const offset = 5;

    ctx.fillStyle = "white";

    let eye1X, eye1Y, eye2X, eye2Y;
    if (direction.x === 1) {
        eye1X = x + CELL_SIZE - offset; eye1Y = y + offset;
        eye2X = x + CELL_SIZE - offset; eye2Y = y + CELL_SIZE - offset;
    } else if (direction.x === -1) {
        eye1X = x + offset; eye1Y = y + offset;
        eye2X = x + offset; eye2Y = y + CELL_SIZE - offset;
    } else if (direction.y === -1) {
        eye1X = x + offset; eye1Y = y + offset;
        eye2X = x + CELL_SIZE - offset; eye2Y = y + offset;
    } else {
        eye1X = x + offset; eye1Y = y + CELL_SIZE - offset;
        eye2X = x + CELL_SIZE - offset; eye2Y = y + CELL_SIZE - offset;
    }

    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    gameOver = true;
    finalScoreEl.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
    }

    overlay.classList.remove("hidden");
}

function gameLoop(currentTime) {
    if (!lastMoveTime) {
        lastMoveTime = currentTime;
    }

    const deltaTime = currentTime - lastMoveTime;

    if (deltaTime >= MOVE_INTERVAL) {
        if (!gameOver) {
            moveSnake();
            update();
        }
        lastMoveTime = currentTime;
    }

    draw();

    if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

document.addEventListener("keydown", function (e) {
    if (gameOver) {
        return;
    }

    const key = e.key;

    if (key === "ArrowUp" && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
        e.preventDefault();
    } else if (key === "ArrowDown" && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
        e.preventDefault();
    } else if (key === "ArrowLeft" && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
        e.preventDefault();
    } else if (key === "ArrowRight" && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
        e.preventDefault();
    }
});

restartBtn.addEventListener("click", function () {
    initGame();
});

initGame();