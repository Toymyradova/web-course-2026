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
let apple = { x: 0, y: 0 };
let particles = [];
let score = 0;
let records = [];
let gameOver = false;
let paused = false;
let started = false;
let lastMoveTime = 0;
let rafId = null;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { audioCtx = null; }
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

function loadRecords() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) records = JSON.parse(stored);
        if (!Array.isArray(records)) records = [];
    } catch (e) { records = []; }
    renderRecords();
}

function saveRecords() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) {}
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

        const scoreSpan = document.createElement("span");
        scoreSpan.className = "score-val";
        scoreSpan.textContent = r.score;

        const dateSpan = document.createElement("span");
        dateSpan.className = "date-val";
        dateSpan.textContent = r.date || "";

        li.appendChild(place);
        li.appendChild(scoreSpan);
        li.appendChild(dateSpan);
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
                if (snake[i].x === x && snake[i].y === y) { occupied = true; break; }
            }
            if (!occupied) free.push({ x, y });
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
        createParticles(apple.x, apple.y)
    }
}