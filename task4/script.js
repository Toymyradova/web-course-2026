let secretNumber = [];   
let attempts = 0;        
let history = [];        

function generateNumber() {
    const digits = [];
    while (digits.length < 4) {
        const d = Math.floor(Math.random() * 10);
        if (!digits.includes(d)) {
            digits.push(d);
        }
    }
    return digits;
}

function validateInput(input) {

    if (!/^\d{4}$/.test(input)) {
        return "Введите ровно 4 цифры!";
    }
    const digits = input.split("");
    if (new Set(digits).size !== 4) {
        return "Цифры не должны повторяться!";
    }
    return null; 
}

function countBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}

function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = ""; 
    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.guess} → ${item.bulls} бык(ов), ${item.cows} корова(ы)`;
        list.appendChild(li);
    });
}

function handleCheck() {
    const input = document.getElementById("guess-input").value;
    const message = document.getElementById("message");

    const error = validateInput(input);
    if (error) {
        message.textContent = error;
        return;
    }

    const guess = input.split("").map(Number);

    const { bulls, cows } = countBullsAndCows(guess, secretNumber);

    attempts++;
    document.getElementById("attempts").textContent = attempts;

    history.push({ guess: input, bulls, cows });
    renderHistory();

    message.textContent = `${bulls} бык(ов), ${cows} корова(ы)`;

    if (bulls === 4) {
        message.textContent = `Победа! Угадано за ${attempts} попыток!`;
        document.getElementById("guess-input").disabled = true;
        document.getElementById("check-btn").disabled = true;
    }

    document.getElementById("guess-input").value = "";
}

function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];
    document.getElementById("attempts").textContent = 0;
    document.getElementById("message").textContent = "";
    document.getElementById("guess-input").value = "";
    document.getElementById("guess-input").disabled = false;
    document.getElementById("check-btn").disabled = false;
    renderHistory();
    console.log("Загаданное число:", secretNumber.join("")); 
}

document.getElementById("check-btn").addEventListener("click", handleCheck);
document.getElementById("new-game-btn").addEventListener("click", newGame);

newGame(); 