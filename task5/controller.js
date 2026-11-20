// Обертка IIFE
(function () {
    "use strict";

    // САМ КОНТРОЛЛЕР (Посредник) ---
    const Controller = {
        model: null,
        view: null,
        timers: [], // Массив для хранения ID всех таймеров

        // 1. Связываем Model и View
        init: function (model, view) {
            this.model = model;
            this.view = view;

            // Даем View цвета из Model, чтобы он создал кнопки
            this.view.init(model.colors);

            // Привязываем обработчики (через bind, чтобы this остался Controller)
            this.view.bindStart(this.handleStart.bind(this));
            this.view.bindButtonClick(this.handlePlayerClick.bind(this));

            // Стартовое сообщение
            this.view.setStatus("Нажми «Старт», чтобы начать", "");
            this.view.setLevel(0);
        },

        // 2. Очистка всех таймеров (защита от "зависаний")
        clearTimers: function () {
            this.timers.forEach(clearTimeout);
            this.timers = [];
        },

        // 3. Умный setTimeout: запоминает ID таймера
        schedule: function (callback, delay) {   //schedule-это ключ свойства в объекте. 
            // callback-функция которую нужно выполнить позже (через некоторое время)
            // delay-время задержки в миллисекундах 
            const id = setTimeout(callback, delay); 
            //планирует выполнение callback через delay миллисекунд и сохраняет идентификатор таймера в переменную id.
            this.timers.push(id); // Автоматически сохраняем ID
            return id;
        },

        // 4. Нажатие на кнопку "Старт"
        handleStart: function () {
            this.clearTimers();       // Очищаем старые таймеры
            this.model.reset();       // Сбрасываем модель (обнуляем уровень, последовательность)
            this.model.startGame();   // Запускаем новую игру (генерируем первый шаг)

            // Разблокируем кнопки и меняем текст на кнопке "Старт"
            this.view.setButtonsDisabled(false);
            this.view.setStartButtonText("🔄 Новая игра");
            this.view.setLevel(this.model.getLevel()); // Обновляем уровень на экране

            this.showSequence();      // Показываем последовательность
        },

        // 5. Клик по цветной кнопке (игрок делает ход)
        handlePlayerClick: function (index) {
            // Если сейчас показ — игнорируем клик
            if (!this.model.isActive()) return;

            // Подсвечиваем нажатую кнопку
            this.view.flashButton(index, this.model.timing.clickFeedback);

            // Спрашиваем Модель: правильный это ответ?
            const result = this.model.checkAnswer(index);

            // Если правильно и раунд закончен
            if (result.correct && result.roundComplete) {
                this.view.setStatus("✅ Отлично! Следующий уровень...", "good");
                // Через задержку переходим на новый уровень
                this.schedule(this.goNextRound.bind(this), this.model.timing.nextRoundDelay);
                return;
            }

            // Если ошибка
            if (!result.correct) {
                this.view.setStatus("❌ Ошибка! Ты дошёл до уровня " + this.model.getLevel(), "bad");
                this.model.setGameOver(); // Сообщаем Модели, что игра окончена
                this.clearTimers(); // Останавливаем все таймеры
                this.view.setStartButtonText("🔄 Играть снова");
            }
        },

        // 6. Переход на новый уровень
        goNextRound: function () {
            this.model.nextRound(); // Модель добавляет новый шаг
            this.view.setLevel(this.model.getLevel()); // Обновляем уровень на экране
            this.showSequence();    // Снова показываем последовательность
        },

        // 7. Показ последовательности (главный визуальный цикл)
        showSequence: function () {
            const sequence = this.model.getSequence(); // Берем массив кнопок, которые нужно мигнуть
            const timing = this.model.timing; // Берем настройки задержек
            // Вычисляем длительность одного шага (показ + пауза)
            const stepDuration = timing.showDelay + timing.gapDelay; // Длительность 1 шага

            this.view.setStatus("Смотри внимательно...", "");

            // Для каждого шага ставим таймер на мигание
            sequence.forEach((buttonIndex, i) => {
                this.schedule(() => {
                    this.view.flashButton(buttonIndex, timing.showDelay);
                }, i * stepDuration); // 0мс, 800мс, 1600мс и т.д.
            });

            // Общее время показа + пауза в конце
            const totalTime = sequence.length * stepDuration + timing.endDelay;

            // Когда показ закончится — передаем ход игроку
            this.schedule(() => {
                this.model.setWaiting(); // Модель: "жду твой ответ"
                this.view.setStatus("🎯 Твой ход! Повтори последовательность.", "");
            }, totalTime);
        }
    };

    // Запуск после загрузки страницы
    document.addEventListener("DOMContentLoaded", function () {
        // Передаем Модель и View в Контроллер, чтобы он их связал
        Controller.init(window.SimonModel, window.SimonView);
    });
})();