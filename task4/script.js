let secretNumber = [];
let attempts = 0;
let totalBulls = 0;
let totalCows = 0;
let history = [];
let gameOver = false;

const input = document.getElementById("guess-input");
const checkBtn = document.getElementById("check-btn");
const newGameBtn = document.getElementById("new-game-btn");
const hintBtn = document.getElementById("hint-btn");
const message = document.getElementById("message");
const attemptsEl = document.getElementById("attempts");
const totalBullsEl = document.getElementById("total-bulls");
const totalCowsEl = document.getElementById("total-cows");
const historyList = document.getElementById("history-list");
const winModal = document.getElementById("win-modal");
const winAttempts = document.getElementById("win-attempts");
const winSecret = document.getElementById("win-secret");
const winNewGame = document.getElementById("win-new-game");
const confettiContainer = document.getElementById("confetti-container");

function generateNumber() {
    const digits = [];
    while (digits.length < 4) {
        const d = Math.floor(Math.random() * 10);
        if (digits.indexOf(d) === -1) {
            digits.push(d);
        }
    }
    return digits;
}

function validateInput(value) {
    if (!/^\d{4}$/.test(value)) {
        return "Введите ровно 4 цифры!";
    }
    const digits = value.split("");
    const unique = [];
    for (let i = 0; i < digits.length; i++) {
        if (unique.indexOf(digits[i]) === -1) {
            unique.push(digits[i]);
        }
    }
    if (unique.length !== 4) {
        return "Цифры не должны повторяться!";
    }
    return null;
}

function countBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (Number(guess[i]) === secret[i]) {
            bulls = bulls + 1;
        } else if (secret.indexOf(Number(guess[i])) !== -1) {
            cows = cows + 1;
        }
    }
    return { bulls: bulls, cows: cows };
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function renderHistory() {
    historyList.innerHTML = "";
    for (let i = 0; i < history.length; i++) {
        const item = history[i];
        const li = document.createElement("li");
        li.className = "history-item";
        if (item.win) {
            li.classList.add("win");
        }

        const guessSpan = document.createElement("span");
        guessSpan.className = "guess";
        guessSpan.textContent = item.guess;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result";
        resultSpan.innerHTML =
            '<span class="bulls-count">🐂 ' + item.bulls + '</span> бык(ов), ' +
            '<span class="cows-count">🐄 ' + item.cows + '</span> корова(ы)';

        li.appendChild(guessSpan);
        li.appendChild(resultSpan);
        historyList.appendChild(li);
    }
}

function updateStats() {
    attemptsEl.textContent = attempts;
    totalBullsEl.textContent = totalBulls;
    totalCowsEl.textContent = totalCows;
}

function createConfetti() {
    confettiContainer.innerHTML = "";
    const colors = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#fbbf24"];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 2) + "s";
        piece.style.animationDelay = Math.random() * 0.5 + "s";
        piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
        confettiContainer.appendChild(piece);
    }
}

function showWinModal() {
    winAttempts.textContent = attempts;
    winSecret.textContent = secretNumber.join("");
    winModal.classList.remove("hidden");
    createConfetti();
}

function handleCheck() {
    if (gameOver) {
        return;
    }

    const value = input.value.trim();
    const error = validateInput(value);

    if (error) {
        showMessage("❌ " + error, "error");
        return;
    }

    const result = countBullsAndCows(value, secretNumber);
    attempts = attempts + 1;
    totalBulls = totalBulls + result.bulls;
    totalCows = totalCows + result.cows;

    history.push({
        guess: value,
        bulls: result.bulls,
        cows: result.cows,
        win: result.bulls === 4
    });

    updateStats();
    renderHistory();

    if (result.bulls === 4) {
        gameOver = true;
        showMessage("🎉 Победа! Угадано за " + attempts + " попыток!", "success");
        input.disabled = true;
        checkBtn.disabled = true;
        showWinModal();
    } else {
        showMessage("🐂 " + result.bulls + " бык(ов), 🐄 " + result.cows + " корова(ы)", "info");
    }

    input.value = "";
    input.focus();
}

function handleHint() {
    if (gameOver) {
        return;
    }
    const position = Math.floor(Math.random() * 4);
    const digit = secretNumber[position];
    showMessage("💡 Подсказка: на позиции " + (position + 1) + " стоит цифра " + digit, "info");
}

function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    totalBulls = 0;
    totalCows = 0;
    history = [];
    gameOver = false;

    updateStats();
    renderHistory();
    showMessage("🎮 Новая игра! Угадай число!", "info");

    input.value = "";
    input.disabled = false;
    checkBtn.disabled = false;
    input.focus();

    winModal.classList.add("hidden");
    confettiContainer.innerHTML = "";

    console.log("Загаданное число:", secretNumber.join(""));
}

checkBtn.addEventListener("click", handleCheck);
newGameBtn.addEventListener("click", newGame);
hintBtn.addEventListener("click", handleHint);
winNewGame.addEventListener("click", newGame);

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        handleCheck();
    }
});

input.addEventListener("input", function () {
    input.value = input.value.replace(/\D/g, "");
});

newGame();