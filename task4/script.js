let secretNumber = [];
let attempts = 0;
let history = [];
let totalBulls = 0;
let totalCows = 0;

const input = document.getElementById("guess-input");
const checkBtn = document.getElementById("check-btn");
const newGameBtn = document.getElementById("new-game-btn");
const hintBtn = document.getElementById("hint-btn");
const list = document.getElementById("history-list");
const message = document.getElementById("message");
const attemptsEl = document.getElementById("attempts");
const totalBullsEl = document.getElementById("total-bulls");
const totalCowsEl = document.getElementById("total-cows");
const winModal = document.getElementById("win-modal");
const winAttempts = document.getElementById("win-attempts");
const winSecret = document.getElementById("win-secret");
const winNewGame = document.getElementById("win-new-game");
const confettiContainer = document.getElementById("confetti-container");

function generateNumber() {
    const digits = [];
    while (digits.length < 4) {
        const d = Math.floor(Math.random() * 10);
        if (!digits.includes(d)) digits.push(d);
    }
    return digits;
}

function validateInput(input) {
    if (!/^\d{4}$/.test(input)) {
        return "❗ Введите ровно 4 цифры!";
    }
    const digits = input.split("");
    if (new Set(digits).size !== 4) {
        return "❗ Цифры не должны повторяться!";
    }
    return null;
}

function countBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) bulls++;
        else if (secret.includes(guess[i])) cows++;
    }
    return { bulls, cows };
}

function renderHistory() {
    list.innerHTML = "";
    history.forEach(item => {
        const li = document.createElement("li");
        li.className = "history-item";
        if (item.bulls === 4) li.classList.add("win");

        const guessSpan = document.createElement("span");
        guessSpan.className = "guess";
        guessSpan.textContent = item.guess;

        const resultSpan = document.createElement("span");
        resultSpan.className = "result";
        resultSpan.innerHTML = 
            `<span class="bulls-count">🐂 ${item.bulls} бык(ов)</span>, ` +
            `<span class="cows-count">🐄 ${item.cows} корова(ы)</span>`;

        li.appendChild(guessSpan);
        li.appendChild(resultSpan);
        list.appendChild(li);
    });
}

function handleCheck() {
    const value = input.value.trim();

    const error = validateInput(value);
    if (error) {
        showMessage(error, "error");
        return;
    }

    const guess = value.split("").map(Number);
    const { bulls, cows } = countBullsAndCows(guess, secretNumber);

    attempts++;
    totalBulls += bulls;
    totalCows += cows;

    history.push({ guess: value, bulls, cows });

    attemptsEl.textContent = attempts;
    totalBullsEl.textContent = totalBulls;
    totalCowsEl.textContent = totalCows;

    renderHistory();

    if (bulls === 4) {
        showMessage(`🎉 ПОБЕДА! Угадано за ${attempts} попыток!`, "success");
        input.disabled = true;
        checkBtn.disabled = true;
        setTimeout(showWinModal, 500);
    } else if (bulls === 0 && cows === 0) {
        showMessage("😢 Ни одного попадания! Попробуй ещё.", "info");
    } else {
        showMessage(`🐂 ${bulls} бык(ов), 🐄 ${cows} корова(ы)`, "info");
    }

    input.value = "";
    input.focus();
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function showWinModal() {
    winAttempts.textContent = attempts;
    winSecret.textContent = secretNumber.join("");
    winModal.classList.remove("hidden");
    launchConfetti();
}

function launchConfetti() {
    const colors = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#fbbf24"];
    const emojis = ["🐂", "🐄", "🎉", "⭐", "💚", "🎊", "✨", "🏆"];

    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        if (Math.random() > 0.5) {
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.fontSize = "24px";
            confetti.style.width = "auto";
            confetti.style.height = "auto";
        } else {
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        }

        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.animationDuration = (Math.random() * 2 + 2.5) + "s";
        confetti.style.animationDelay = (Math.random() * 0.5) + "s";

        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

function showHint() {
    if (attempts === 0) {
        showMessage("💡 Сначала сделай хотя бы одну попытку!", "info");
        return;
    }
    const idx = Math.floor(Math.random() * 4);
    const digit = secretNumber[idx];
    showMessage(`💡 На позиции ${idx + 1} стоит цифра ${digit}`, "info");
}

function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];
    totalBulls = 0;
    totalCows = 0;

    attemptsEl.textContent = "0";
    totalBullsEl.textContent = "0";
    totalCowsEl.textContent = "0";
    message.textContent = "";
    message.className = "message";
    input.value = "";
    input.disabled = false;
    checkBtn.disabled = false;

    winModal.classList.add("hidden");
    confettiContainer.innerHTML = "";

    renderHistory();
    input.focus();

    console.log("🎯 Загаданное число:", secretNumber.join(""));
}

checkBtn.addEventListener("click", handleCheck);
newGameBtn.addEventListener("click", newGame);
winNewGame.addEventListener("click", newGame);
hintBtn.addEventListener("click", showHint);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !input.disabled) handleCheck();
});

input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
});

newGame();