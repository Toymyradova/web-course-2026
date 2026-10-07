let sequence = [];
let playerIndex = 0;
let isShowingSequence = false;
let gameActive = false;
let level = 0;
let timers = [];

const buttons = document.querySelectorAll(".simon-btn");
const startBtn = document.getElementById("start-btn");
const levelEl = document.getElementById("level");
const statusEl = document.getElementById("status");

const COLORS_COUNT = 4;
const SHOW_DELAY = 600;
const GAP_DELAY = 200;

function clearAllTimers() {
    for (let i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }
    timers = [];
}

function setStatus(text) {
    statusEl.textContent = text;
}

function updateLevel() {
    levelEl.textContent = level;
}

function lightUpButton(index, duration, callback) {
    const btn = buttons[index];
    btn.classList.add("active");

    const t1 = setTimeout(function () {
        btn.classList.remove("active");
        if (callback) {
            callback();
        }
    }, duration);

    timers.push(t1);
}

function showSequence() {
    isShowingSequence = true;
    setStatus("Смотри внимательно...");

    for (let i = 0; i < sequence.length; i++) {
        const index = sequence[i];
        const delay = i * (SHOW_DELAY + GAP_DELAY);

        const t = setTimeout(function () {
            lightUpButton(index, SHOW_DELAY, null);
        }, delay);

        timers.push(t);
    }

    const totalTime = sequence.length * (SHOW_DELAY + GAP_DELAY) + 200;

    const tEnd = setTimeout(function () {
        isShowingSequence = false;
        playerIndex = 0;
        setStatus("Твой ход! Повтори последовательность.");
    }, totalTime);

    timers.push(tEnd);
}

function addRandomStep() {
    const randomIndex = Math.floor(Math.random() * COLORS_COUNT);
    sequence.push(randomIndex);
}

function nextRound() {
    level = level + 1;
    updateLevel();
    addRandomStep();
    showSequence();
}

function handleButtonClick(index) {
    if (isShowingSequence || !gameActive) {
        return;
    }

    lightUpButton(index, 250, null);

    if (sequence[playerIndex] === index) {
        playerIndex = playerIndex + 1;

        if (playerIndex === sequence.length) {
            playerIndex = 0;
            setStatus("✅ Верно! Следующий уровень...");
            setTimeout(function () {
                nextRound();
            }, 800);
        }
    } else {
        gameOver();
    }
}

function gameOver() {
    gameActive = false;
    isShowingSequence = false;
    clearAllTimers();

    setStatus("❌ Ошибка! Ты дошёл до уровня " + level);
    startBtn.textContent = "🔄 Играть снова";

    buttons.forEach(function (btn) {
        btn.disabled = true;
    });
}

function startGame() {
    clearAllTimers();
    sequence = [];
    playerIndex = 0;
    level = 0;
    gameActive = true;
    isShowingSequence = false;

    updateLevel();
    setStatus("🎮 Игра началась!");
    startBtn.textContent = "🔄 Новая игра";

    buttons.forEach(function (btn) {
        btn.disabled = false;
    });

    setTimeout(function () {
        nextRound();
    }, 500);
}

buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        const index = Number(btn.dataset.index);
        handleButtonClick(index);
    });
});

startBtn.addEventListener("click", function () {
    startGame();
});