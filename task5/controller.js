(function () {
    "use strict";

    const Controller = {
        model: null,
        view: null,
        timers: [],

        init: function (model, view) {
            this.model = model;
            this.view = view;

            this.view.init(model.colors);
            this.view.bindStart(this.handleStart.bind(this));
            this.view.bindButtonClick(this.handlePlayerClick.bind(this));

            this.view.setStatus("Нажми «Старт», чтобы начать", "");
            this.view.setLevel(0);
        },

        clearTimers: function () {
            this.timers.forEach(clearTimeout);
            this.timers = [];
        },

        schedule: function (callback, delay) {
            const id = setTimeout(callback, delay);
            this.timers.push(id);
            return id;
        },

        handleStart: function () {
            this.clearTimers();
            this.model.reset();
            this.model.startGame();

            this.view.setButtonsDisabled(false);
            this.view.setStartButtonText("🔄 Новая игра");
            this.view.setLevel(this.model.getLevel());

            this.showSequence();
        },

        handlePlayerClick: function (index) {
            if (!this.model.isActive()) return;

            this.view.flashButton(index, this.model.timing.clickFeedback);

            const result = this.model.checkAnswer(index);

            if (result.correct && result.roundComplete) {
                this.view.setStatus("✅ Отлично! Следующий уровень...", "good");
                this.schedule(this.goNextRound.bind(this), this.model.timing.nextRoundDelay);
                return;
            }

            if (!result.correct) {
                this.view.setStatus("❌ Ошибка! Ты дошёл до уровня " + this.model.getLevel(), "bad");
                this.model.setGameOver();
                this.clearTimers();
                this.view.setStartButtonText("🔄 Играть снова");
            }
        },

        goNextRound: function () {
            this.model.nextRound();
            this.view.setLevel(this.model.getLevel());
            this.showSequence();
        },

        showSequence: function () {
            const sequence = this.model.getSequence();
            const timing = this.model.timing;
            const stepDuration = timing.showDelay + timing.gapDelay;

            this.view.setStatus("👀 Смотри внимательно...", "");

            sequence.forEach((buttonIndex, i) => {
                this.schedule(() => {
                    this.view.flashButton(buttonIndex, timing.showDelay);
                }, i * stepDuration);
            });

            const totalTime = sequence.length * stepDuration + timing.endDelay;

            this.schedule(() => {
                this.model.setWaiting();
                this.view.setStatus("🎯 Твой ход! Повтори последовательность.", "");
            }, totalTime);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        Controller.init(window.SimonModel, window.SimonView);
    });
})();