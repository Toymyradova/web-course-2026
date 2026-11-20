// Обертка IIFE: скрываем переменные от глобальной области видимости
(function () {
    "use strict";

    // --- КОНФИГИ (Принцип Open/Closed) ---
    // Чтобы добавить 5-й цвет, просто допиши сюда { id: "purple", cssClass: "purple" }
    const COLORS = [
        { id: "red",    cssClass: "red"    },
        { id: "blue",   cssClass: "blue"   },
        { id: "green",  cssClass: "green"  },
        { id: "yellow", cssClass: "yellow" }
    ];

    // Все задержки игры в одном месте (меняй тут, логику не трогай)
    const TIMING = {
        showDelay: 600,        // сколько горит кнопка
        gapDelay: 200,         // пауза между кнопками
        endDelay: 200,         // пауза после показа
        clickFeedback: 250,    // сколько горит кнопка при клике
        nextRoundDelay: 900    // пауза перед следующим уровнем
    };

    // --- САМА МОДЕЛЬ (Мозг игры) ---
    const SimonModel = {
        // Ссылки на конфиги
        colors: COLORS,
        timing: TIMING,

        // Состояние игры
        sequence: [],       // Последовательность правильных ответов (например: [2, 0, 3])
        playerIndex: 0,     // На каком по счету шаге сейчас игрок
        level: 0,           // Текущий уровень
        state: "idle",      // Состояние: "idle", "showing", "waiting", "gameover"

        // Сброс игры в начальное состояние
        reset: function () {
            this.sequence = [];
            this.playerIndex = 0;
            this.level = 0;
            this.state = "idle";
        },

        // Старт игры: сброс, 1-й уровень, +1 шаг в последовательность
        startGame: function () {
            this.reset();
            this.state = "showing"; // Включаем режим показа
            this.level = 1;
            this.addRandomStep();
            return this.sequence.slice(); // Возвращаем копию, чтобы никто не сломал данные
        },

        // Генерация случайного шага (от 0 до 3)
        addRandomStep: function () {
            const idx = Math.floor(Math.random() * this.colors.length);
            this.sequence.push(idx);
        },

        // Переход на следующий уровень
        nextRound: function () {
            this.level++;
            this.playerIndex = 0;   // Игрок начинает ввод с 1-го шага
            this.addRandomStep();   // Добавляем 1 новый шаг
            this.state = "showing";
            return this.sequence.slice();
        },

        // Проверяем: сейчас идет показ? (в этот момент клики нельзя)
        isShowing: function () {
            return this.state === "showing";
        },

        // Проверяем: игра вообще активна? (идет показ или ждем клик)
        isActive: function () {
            return this.state === "showing" || this.state === "waiting";
        },

        // --- ГЛАВНАЯ ЛОГИКА: проверка ответа игрока ---
        checkAnswer: function (index) {
            const expected = this.sequence[this.playerIndex]; // Какой должен быть шаг?
            const correct = expected === index;               // Совпало?

            if (correct) {
                this.playerIndex++; // Если верно — переходим к следующему шагу
                
                // Если дошли до конца последовательности — раунд окончен!
                if (this.playerIndex === this.sequence.length) {
                    this.state = "waiting";
                    return { correct: true, roundComplete: true };
                }
                // Верно, но раунд продолжается
                return { correct: true, roundComplete: false };
            }

            // Если неверно — игра окончена
            this.state = "gameover";
            return { correct: false, roundComplete: false };
        },

        // Изменить состояние
        setWaiting: function () { this.state = "waiting"; },
        setGameOver: function () { this.state = "gameover"; },

        // Получить данные (геттеры)
        getLevel: function () { return this.level; },
        getSequence: function () { return this.sequence.slice(); } 
    };

    // Экспортируем Модель наружу (для Controller)
    window.SimonModel = SimonModel;
})();