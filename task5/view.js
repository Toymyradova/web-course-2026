(function () {
    "use strict";

    const SELECTORS = {
        board: "#game-board",
        level: "#level",
        status: "#status",
        startBtn: "#start-btn"
    };

    const CLASSES = {
        simonBtn: "simon-btn",
        active: "active",
        good: "good",
        bad: "bad",
        status: "status"
    };

    const View = {
        elements: {},

        init: function (colors) {
            this.elements.board = document.querySelector(SELECTORS.board);
            this.elements.level = document.querySelector(SELECTORS.level);
            this.elements.status = document.querySelector(SELECTORS.status);
            this.elements.startBtn = document.querySelector(SELECTORS.startBtn);

            this.buildButtons(colors);
        },

        buildButtons: function (colors) {
            this.elements.board.innerHTML = "";

            const fragment = document.createDocumentFragment();

            colors.forEach(function (color, index) {
                const btn = document.createElement("button");
                btn.className = CLASSES.simonBtn + " " + color.cssClass;
                btn.dataset.index = index;
                btn.type = "button";
                fragment.appendChild(btn);
            });

            this.elements.board.appendChild(fragment);
        },

        getButtons: function () {
            return this.elements.board.querySelectorAll("." + CLASSES.simonBtn);
        },

        bindButtonClick: function (handler) {
            this.elements.board.addEventListener("click", function (event) {
                const btn = event.target.closest("." + CLASSES.simonBtn);
                if (!btn) return;
                handler(Number(btn.dataset.index));
            });
        },

        bindStart: function (handler) {
            this.elements.startBtn.addEventListener("click", handler);
        },

        flashButton: function (index, duration) {
            const btn = this.getButtons()[index];
            if (!btn) return;

            btn.classList.add(CLASSES.active);
            setTimeout(function () {
                btn.classList.remove(CLASSES.active);
            }, duration);
        },

        setLevel: function (value) {
            this.elements.level.textContent = value;
        },

        setStatus: function (text, type) {
            this.elements.status.textContent = text;
            this.elements.status.className = CLASSES.status;

            if (type === "good") this.elements.status.classList.add(CLASSES.good);
            if (type === "bad")  this.elements.status.classList.add(CLASSES.bad);
        },

        setStartButtonText: function (text) {
            this.elements.startBtn.textContent = text;
        },

        setButtonsDisabled: function (disabled) {
            this.getButtons().forEach(function (btn) {
                btn.disabled = disabled;
            });
        }
    };

    window.SimonView = View;
})();