// Обертка IIFE (Immediately Invoked Function Expression)
// Нужна, чтобы все переменные внутри были локальными и не "засоряли" глобальную область
(function () {
    "use strict"; // Строгий режим: запрещает неявное создание переменных и другие ошибки

    // КОНФИГ СЕЛЕКТОРОВ
    // Если поменяешь id в HTML — меняй только здесь
    const SELECTORS = {
        board: "#game-board", // Игровое поле (контейнер для кнопок)
        level: "#level", // Элемент, где отображается уровень
        status: "#status", // Элемент для сообщений ("Твой ход", "Ошибка" и т.д.)
        startBtn: "#start-btn" // Кнопка "Старт"
    };

    // КОНФИГ КЛАССОВ 
    const CLASSES = {
        simonBtn: "simon-btn", // Основной класс для цветных кнопок
        active: "active", // Класс для подсветки (мигания) кнопки
        good: "good", // Класс для зеленого сообщения (успех)
        bad: "bad",   // Класс для красного сообщения (ошибка)
        status: "status" // Базовый класс для блока сообщений
    };

    // САМО VIEW (Глаза и руки игры)
    // View отвечает ТОЛЬКО за отображение и работу с DOM. Он не знает правил игры.
    const View = {
        elements: {}, // Сюда сохраняем найденные HTML-элементы

        // 1. Инициализация: найти элементы и создать кнопки
        init: function (colors) {
            // Ищем элементы на странице по селекторам и сохраняем их в объект elements
            this.elements.board = document.querySelector(SELECTORS.board);
            this.elements.level = document.querySelector(SELECTORS.level);
            this.elements.status = document.querySelector(SELECTORS.status);
            this.elements.startBtn = document.querySelector(SELECTORS.startBtn);

            this.buildButtons(colors); // Создаем кнопки по цветам из Model
        },

        // 2. Динамическое создание кнопок (Open/Closed!)
        buildButtons: function (colors) {
            this.elements.board.innerHTML = ""; // Очищаем доску
            
            // DocumentFragment — невидимый контейнер (быстрее, чем вставлять по 1 кнопке)
            const fragment = document.createDocumentFragment();

            // Для каждого цвета из конфига создаем кнопку
            colors.forEach(function (color, index) {
                const btn = document.createElement("button"); // Создаем кнопку
                btn.className = CLASSES.simonBtn + " " + color.cssClass; // Добавляем классы (simon-btn и цвет)
                btn.dataset.index = index; // Сохраняем номер кнопки в HTML (data-index="0" и т.д.)
                btn.type = "button"; // Указываем тип кнопки
                fragment.appendChild(btn); // Кладем кнопку в невидимый контейнер
            });

            this.elements.board.appendChild(fragment); // Вставляем все разом
        },

        // 3. Получить все кнопки
        getButtons: function () {
            return this.elements.board.querySelectorAll("." + CLASSES.simonBtn);
        },

        // 4. Делегирование кликов (1 обработчик на всю доску)
        bindButtonClick: function (handler) {
            // Вешаем ОДИН обработчик на всю доску, а не на каждую кнопку.
            // Это экономит память и работает быстрее.
            this.elements.board.addEventListener("click", function (event) {
                // Находим кнопку, по которой кликнули
                const btn = event.target.closest("." + CLASSES.simonBtn);
                if (!btn) return; // Если кликнули мимо кнопки — ничего не делаем
                
                // Передаем номер кнопки в Controller
                handler(Number(btn.dataset.index));
            });
        },

        // 5. Обработчик кнопки "Старт"
        bindStart: function (handler) {
            // Когда игрок нажимает "Старт", вызывается функция handler (из Controller)
            this.elements.startBtn.addEventListener("click", handler);
        },

        // 6. Мигание кнопки (подсветка)
        flashButton: function (index, duration) {
            const btn = this.getButtons()[index]; // Находим кнопку по её номеру
            if (!btn) return;  // Защита, если кнопки нет

            btn.classList.add(CLASSES.active); // Включаем подсветку
            setTimeout(function () {
                btn.classList.remove(CLASSES.active); // Выключаем через duration
            }, duration);
        },

        // 7. Обновление уровня
        setLevel: function (value) {
            // Просто меняем текст внутри элемента level на новое значение
            this.elements.level.textContent = value;
        },

        // 8. Обновление сообщения (зеленое / красное / обычное)
        setStatus: function (text, type) {
            this.elements.status.textContent = text;
            // Сбрасываем все классы и ставим базовый
            this.elements.status.className = CLASSES.status;

            if (type === "good") this.elements.status.classList.add(CLASSES.good);
            // Если type === "good", добавляем зеленый класс
            if (type === "bad")  this.elements.status.classList.add(CLASSES.bad);
            // Если type === "bad", добавляем красный класс
        },

        // 9. Смена текста на кнопке "Старт"
        setStartButtonText: function (text) {
            // Меняем текст кнопки (например, на "🔄 Новая игра")
            this.elements.startBtn.textContent = text;
        },

        // 10. Блокировка / разблокировка кнопок
        setButtonsDisabled: function (disabled) {
            this.getButtons().forEach(function (btn) {
                btn.disabled = disabled;
            });
        }
    };

    // Экспортируем View наружу (для Controller)
    window.SimonView = View;
})();