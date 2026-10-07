const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");

const newGameBtn = document.getElementById("new-game-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const toMenuBtn = document.getElementById("to-menu-btn");
const clearRecordsBtn = document.getElementById("clear-records-btn");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const lengthEl = document.getElementById("length");

const overlayPause = document.getElementById("overlay-pause");
const overlayGameover = document.getElementById("overlay-gameover");

const finalScoreEl = document.getElementById("final-score");
const finalLengthEl = document.getElementById("final-length");
const recordsList = document.getElementById("records-list");

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const MOVE_INTERVAL = 140;
const MAX_RECORDS = 5;
const STORAGE_KEY = "neon-snake-records";

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 5, y: 5 };
let particles = [];
let score = 0;
let records = [];
let gameOver = false;
let paused = false;
let started = false;
let lastMoveTime = 0;
let rafId = null;
let audioCtx = null;

function loadRecords() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        records = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(records)) records = [];
    } catch (e) {
        records = [];
    }
    renderRecords();
}

function saveRecords() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {}
}

function renderRecords() {
    recordsList.innerHTML = "";

    if (records.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "Пока нет рекордов";
        recordsList.appendChild(li);
        return;
    }

    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const li = document.createElement("li");

        const place = document.createElement("span");
        place.className = "place";
        if (i === 0) place.classList.add("gold");
        else if (i === 1) place.classList.add("silver");
        else if (i === 2) place.classList.add("bronze");
        place.textContent = "#" + (i + 1);

        const sc = document.createElement("span");
        sc.className = "score-val";
        sc.textContent = r.score;

        const dt = document.createElement("span");
        dt.className = "date-val";
        dt.textContent = r.date || "";

        li.appendChild(place);
        li.appendChild(sc);
        li.appendChild(dt);
        recordsList.appendChild(li);
    }
}

function addRecord(scoreVal) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    records.push({ score: scoreVal, date: dateStr });
    records.sort(function (a, b) { return b.score - a.score; });
    if (records.length > MAX_RECORDS) records = records.slice(0, MAX_RECORDS);
    saveRecords();
    renderRecords();
}

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioCtx = null;
        }
    }
}

function playTone(freq, duration, type, volume) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || "square";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume || 0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    particles = [];
    score = 0;
    gameOver = false;
    paused = false;
    started = true;
    lastMoveTime = 0;

    scoreEl.textContent = "0";
    lengthEl.textContent = "3";
    highScoreEl.textContent = records.length > 0 ? records[0].score : "0";

    overlayPause.classList.add("hidden");
    overlayGameover.classList.add("hidden");

    spawnApple();
    draw();

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameLoop);
}

function showGame() {
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initAudio();
    initGame();
}

function showMenu() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    started = false;
    gameOver = true;
    paused = false;
    gameScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    highScoreEl.textContent = records.length > 0 ? records[0].score : "0";
}

function spawnApple() {
    const free = [];
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            let occupied = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === x && snake[i].y === y) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) free.push({ x: x, y: y });
        }
    }
    if (free.length === 0) return;
    apple = free[Math.floor(Math.random() * free.length)];
}

function moveSnake() {
    direction = nextDirection;
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };
    snake.unshift(newHead);

    if (newHead.x === apple.x && newHead.y === apple.y) {
        score++;
        scoreEl.textContent = score;
        lengthEl.textContent = snake.length;
        createParticles(apple.x, apple.y, "#ff2d95");
        playTone(880, 0.08, "square", 0.06);
        spawnApple();
    } else {
        snake.pop();
    }
}

function createParticles(cx, cy, color) {
    const px = cx * CELL + CELL / 2;
    const py = cy * CELL + CELL / 2;
    for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14;
        const speed = 1.5 + Math.random() * 2;
        particles.push({
            x: px, y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1, color: color,
            size: 2 + Math.random() * 2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return true;
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

function update() {
    if (gameOver || paused) return;
    if (checkCollision()) endGame();
}

function draw() {
    ctx.fillStyle = "#05070f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawApple();
    drawSnake();
    drawParticles();
}

function drawGrid() {
    ctx.strokeStyle = "rgba(57, 255, 20, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(canvas.width, i * CELL);
        ctx.stroke();
    }
}

function drawApple() {
    const cx = apple.x * CELL + CELL / 2;
    const cy = apple.y * CELL + CELL / 2;
    const r = CELL / 2 - 3;
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.12;

    ctx.save();
    ctx.shadowColor = "#ff2d95";
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#ff2d95";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
    ctx.restore();
}

function drawSnake() {
    for (let i = snake.length - 1; i >= 0; i--) {
        const seg = snake[i];
        const x = seg.x * CELL;
        const y = seg.y * CELL;
        const pad = 2;
        const isHead = i === 0;
        const t = i / Math.max(snake.length - 1, 1);
        const r = Math.round(57 + (0 - 57) * t);
        const g = Math.round(255 + (229 - 255) * t);
        const b = Math.round(20 + (255 - 20) * t);
        const color = "rgb(" + r + "," + g + "," + b + ")";

        ctx.save();
        if (isHead) {
            ctx.shadowColor = "#39ff14";
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        roundRect(ctx, x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 6 : 5);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
    drawEyes();
}

function drawEyes() {
    const head = snake[0];
    if (!head) return;
    const x = head.x * CELL;
    const y = head.y * CELL;
    const eyeSize = 3;
    const offset = 5;
    let e1x, e1y, e2x, e2y;
    if (direction.x === 1) {
        e1x = x + CELL - offset; e1y = y + offset;
        e2x = x + CELL - offset; e2y = y + CELL - offset;
    } else if (direction.x === -1) {
        e1x = x + offset; e1y = y + offset;
        e2x = x + offset; e2y = y + CELL - offset;
    } else if (direction.y === -1) {
        e1x = x + offset; e1y = y + offset;
        e2x = x + CELL - offset; e2y = y + offset;
    } else {
        e1x = x + offset; e1y = y + CELL - offset;
        e2x = x + CELL - offset; e2y = y + CELL - offset;
    }
    ctx.save();
    ctx.fillStyle = "#05070f";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
    ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}

function endGame() {
    gameOver = true;
    createParticles(snake[0].x, snake[0].y, "#ff3b3b");
    playTone(120, 0.4, "sawtooth", 0.08);
    addRecord(score);
    finalScoreEl.textContent = score;
    finalLengthEl.textContent = snake.length;
    overlayGameover.classList.remove("hidden");
}

function gameLoop(currentTime) {
    if (!lastMoveTime) lastMoveTime = currentTime;
    const delta = currentTime - lastMoveTime;

    if (delta >= MOVE_INTERVAL) {
        if (started && !gameOver && !paused) {
            moveSnake();
            update();
        }
        lastMoveTime = currentTime;
    }

    updateParticles();
    draw();

    if (!gameOver) {
        rafId = requestAnimationFrame(gameLoop);
    }
}

function togglePause() {
    if (!started || gameOver) return;
    paused = !paused;
    if (paused) {
        overlayPause.classList.remove("hidden");
    } else {
        overlayPause.classList.add("hidden");
        lastMoveTime = 0;
        rafId = requestAnimationFrame(gameLoop);
    }
}

function changeDirection(dir) {
    if (gameOver || paused) return;
    if (dir === "up" && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    else if (dir === "down" && direction.y !== -1) nextDirection = { x: 0, y: 1 };
    else if (dir === "left" && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    else if (dir === "right" && direction.x !== -1) nextDirection = { x: 1, y: 0 };
}

document.addEventListener("keydown", function (e) {
    const k = e.key;
    if (k === "ArrowUp")    { changeDirection("up");    e.preventDefault(); }
    if (k === "ArrowDown")  { changeDirection("down");  e.preventDefault(); }
    if (k === "ArrowLeft")  { changeDirection("left");  e.preventDefault(); }
    if (k === "ArrowRight") { changeDirection("right"); e.preventDefault(); }
    if (k === " " || k === "Spacebar") { togglePause(); e.preventDefault(); }
});

document.querySelectorAll(".touch-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        changeDirection(btn.dataset.dir);
    });
});

newGameBtn.addEventListener("click", showGame);
backToMenuBtn.addEventListener("click", showMenu);
toMenuBtn.addEventListener("click", showMenu);
restartBtn.addEventListener("click", initGame);
resumeBtn.addEventListener("click", togglePause);
pauseBtn.addEventListener("click", togglePause);

clearRecordsBtn.addEventListener("click", function () {
    if (confirm("Удалить все рекорды?")) {
        records = [];
        saveRecords();
        renderRecords();
    }
});

loadRecords();