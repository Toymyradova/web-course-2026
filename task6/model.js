(function () {
    "use strict";

    const CELL = 20;
    const COLS = 20;
    const ROWS = 20;
    const MAX_RECORDS = 5;
    const STORAGE_KEY = "neon-snake-records";

    const SnakeModel = {
        cell: CELL,
        cols: COLS,
        rows: ROWS,

        snake: [],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        apple: { x: 5, y: 5 },
        score: 0,
        records: [],
        gameOver: false,
        paused: false,

        reset: function () {
            this.snake = [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ];
            this.direction = { x: 1, y: 0 };
            this.nextDirection = { x: 1, y: 0 };
            this.score = 0;
            this.gameOver = false;
            this.paused = false;
            this.spawnApple();
        },

        setDirection: function (dir) {
            if (this.paused || this.gameOver) return;
            
            if (dir === "up" && this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
            else if (dir === "down" && this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
            else if (dir === "left" && this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
            else if (dir === "right" && this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
        },

        move: function () {
            if (this.gameOver || this.paused) return { moved: false };

            this.direction = this.nextDirection;
            const head = this.snake[0];
            const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };
            
            this.snake.unshift(newHead);

            let ateApple = false;
            if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
                this.score++;
                ateApple = true;
                this.spawnApple();
            } else {
                this.snake.pop();
            }

            const dead = this.checkCollision();
            if (dead) {
                this.gameOver = true;
            }

            return { moved: true, ateApple: ateApple, dead: dead };
        },

        checkCollision: function () {
            const head = this.snake[0];
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) return true;
            for (let i = 1; i < this.snake.length; i++) {
                if (this.snake[i].x === head.x && this.snake[i].y === head.y) return true;
            }
            return false;
        },

        spawnApple: function () {
            const free = [];
            for (let x = 0; x < this.cols; x++) {
                for (let y = 0; y < this.rows; y++) {
                    let occupied = false;
                    for (let i = 0; i < this.snake.length; i++) {
                        if (this.snake[i].x === x && this.snake[i].y === y) {
                            occupied = true; break;
                        }
                    }
                    if (!occupied) free.push({ x: x, y: y });
                }
            }
            if (free.length > 0) {
                this.apple = free[Math.floor(Math.random() * free.length)];
            }
        },

        togglePause: function () {
            if (!this.gameOver) {
                this.paused = !this.paused;
            }
            return this.paused;
        },

        loadRecords: function () {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                this.records = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(this.records)) this.records = [];
            } catch (e) {
                this.records = [];
            }
            return this.records;
        },

        addRecord: function () {
            const now = new Date();
            const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
            this.records.push({ score: this.score, date: dateStr });
            this.records.sort(function (a, b) { return b.score - a.score; });
            if (this.records.length > MAX_RECORDS) this.records = this.records.slice(0, MAX_RECORDS);
            
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
            } catch (e) {}
            return this.records;
        },

        clearRecords: function () {
            this.records = [];
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {}
            return this.records;
        }
    };

    window.SnakeModel = SnakeModel;
})();