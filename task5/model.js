(function () {
    "use strict";

    const COLORS = [
        { id: "red",    cssClass: "red"    },
        { id: "blue",   cssClass: "blue"   },
        { id: "green",  cssClass: "green"  },
        { id: "yellow", cssClass: "yellow" }
    ];

    const TIMING = {
        showDelay: 600,
        gapDelay: 200,
        endDelay: 200,
        clickFeedback: 250,
        nextRoundDelay: 900
    };

    const SimonModel = {
        colors: COLORS,
        timing: TIMING,

        sequence: [],
        playerIndex: 0,
        level: 0,
        state: "idle",

        reset: function () {
            this.sequence = [];
            this.playerIndex = 0;
            this.level = 0;
            this.state = "idle";
        },

        startGame: function () {
            this.reset();
            this.state = "showing";
            this.level = 1;
            this.addRandomStep();
            return this.sequence.slice();
        },

        addRandomStep: function () {
            const idx = Math.floor(Math.random() * this.colors.length);
            this.sequence.push(idx);
        },

        nextRound: function () {
            this.level++;
            this.playerIndex = 0;
            this.addRandomStep();
            this.state = "showing";
            return this.sequence.slice();
        },

        isShowing: function () {
            return this.state === "showing";
        },

        isActive: function () {
            return this.state === "showing" || this.state === "waiting";
        },

        checkAnswer: function (index) {
            const expected = this.sequence[this.playerIndex];
            const correct = expected === index;

            if (correct) {
                this.playerIndex++;
                if (this.playerIndex === this.sequence.length) {
                    this.state = "waiting";
                    return { correct: true, roundComplete: true };
                }
                return { correct: true, roundComplete: false };
            }

            this.state = "gameover";
            return { correct: false, roundComplete: false };
        },

        setWaiting: function () {
            this.state = "waiting";
        },

        setGameOver: function () {
            this.state = "gameover";
        },

        getLevel: function () {
            return this.level;
        },

        getSequence: function () {
            return this.sequence.slice();
        }
    };

    window.SimonModel = SimonModel;
})();