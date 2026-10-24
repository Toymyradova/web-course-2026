(function () {
    "use strict";

    const MOVE_INTERVAL = 140;

    const Controller = {
        model: null,
        view: null,
        particles: [],
        lastMoveTime: 0,
        rafId: null,
        audioCtx: null,

        init: function (model, view) {
            this.model = model;
            this.view = view;

            this.model.loadRecords();
            this.view.init(this.model);

            this.bindEvents();
        },

        bindEvents: function () {
            const self = this;

            document.getElementById("new-game-btn").addEventListener("click", function () { self.startGame(); });
            document.getElementById("back-to-menu-btn").addEventListener("click", function () { self.showMenu(); });
            document.getElementById("to-menu-btn").addEventListener("click", function () { self.showMenu(); });
            document.getElementById("restart-btn").addEventListener("click", function () { self.startGame(); });
            
            document.getElementById("pause-btn").addEventListener("click", function () { self.togglePause(); });
            document.getElementById("resume-btn").addEventListener("click", function () { self.togglePause(); });

            document.getElementById("clear-records-btn").addEventListener("click", function () {
                if (confirm("Удалить все рекорды?")) {
                    const recs = self.model.clearRecords();
                    self.view.renderRecords(recs);
                }
            });

            document.addEventListener("keydown", function (e) {
                const k = e.key;
                if (k === "ArrowUp")    { self.model.setDirection("up");    e.preventDefault(); }
                if (k === "ArrowDown")  { self.model.setDirection("down");  e.preventDefault(); }
                if (k === "ArrowLeft")  { self.model.setDirection("left");  e.preventDefault(); }
                if (k === "ArrowRight") { self.model.setDirection("right"); e.preventDefault(); }
                if (k === " " || k === "Spacebar") { self.togglePause(); e.preventDefault(); }
            });

            document.querySelectorAll(".touch-btn").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    self.model.setDirection(btn.dataset.dir);
                });
            });
        },

        startGame: function () {
            this.initAudio();
            this.model.reset();
            this.particles = [];
            this.lastMoveTime = 0;

            this.view.showGameScreen();
            
            const highScore = this.model.records.length > 0 ? this.model.records[0].score : 0;
            this.view.updateHUD(this.model.score, this.model.snake.length, highScore);

            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
        },

        showMenu: function () {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.view.showMenuScreen(this.model.records);
        },

        togglePause: function () {
            const isPaused = this.model.togglePause();
            this.view.togglePauseOverlay(isPaused);
            if (!isPaused) {
                this.lastMoveTime = 0; 
                this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
            }
        },

        gameLoop: function (currentTime) {
            if (!this.lastMoveTime) this.lastMoveTime = currentTime;
            const delta = currentTime - this.lastMoveTime;

            if (delta >= MOVE_INTERVAL) {
                const result = this.model.move();
                
                if (result.moved) {
                    this.updateParticles();
                    this.view.updateHUD(this.model.score, this.model.snake.length, this.getHighScore());

                    if (result.ateApple) {
                        this.createParticles(this.model.apple.x, this.model.apple.y, "#ff2d95"); 
                        this.playTone(880, 0.08, "square", 0.06);
                    }
                    if (result.dead) {
                        this.handleGameOver();
                        return; 
                    }
                }
                this.lastMoveTime = currentTime;
            }

            this.view.render(this.model, this.particles);
            
            if (!this.model.gameOver) {
                this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
            }
        },

        handleGameOver: function () {
            this.createParticles(this.model.snake[0].x, this.model.snake[0].y, "#ff3b3b");
            this.playTone(120, 0.4, "sawtooth", 0.08);
            
            this.model.addRecord();
            this.view.showGameOver(this.model.score, this.model.snake.length);
        },

        getHighScore: function () {
            return this.model.records.length > 0 ? this.model.records[0].score : 0;
        },

        createParticles: function (cx, cy, color) {
            const px = cx * this.model.cell + this.model.cell / 2;
            const py = cy * this.model.cell + this.model.cell / 2;
            for (let i = 0; i < 14; i++) {
                const angle = (Math.PI * 2 * i) / 14;
                const speed = 1.5 + Math.random() * 2;
                this.particles.push({
                    x: px, y: py,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1, color: color,
                    size: 2 + Math.random() * 2
                });
            }
        },

        updateParticles: function () {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.94; p.vy *= 0.94;
                p.life -= 0.03;
                if (p.life <= 0) this.particles.splice(i, 1);
            }
        },

        initAudio: function () {
            if (!this.audioCtx) {
                try {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) { this.audioCtx = null; }
            }
        },

        playTone: function (freq, duration, type, volume) {
            if (!this.audioCtx) return;
            try {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = type || "square";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(volume || 0.05, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start();
                osc.stop(this.audioCtx.currentTime + duration);
            } catch (e) {}
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        Controller.init(window.SnakeModel, window.SnakeView);
    });
})();