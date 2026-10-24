(function () {
    "use strict";

    const View = {
        canvas: null,
        ctx: null,
        elements: {},

        init: function (model) {
            this.canvas = document.getElementById("game-canvas");
            this.ctx = this.canvas.getContext("2d");

            this.elements = {
                menu: document.getElementById("menu-screen"),
                game: document.getElementById("game-screen"),
                score: document.getElementById("score"),
                highScore: document.getElementById("high-score"),
                length: document.getElementById("length"),
                overlayPause: document.getElementById("overlay-pause"),
                overlayGameover: document.getElementById("overlay-gameover"),
                finalScore: document.getElementById("final-score"),
                finalLength: document.getElementById("final-length"),
                recordsList: document.getElementById("records-list")
            };

            this.clearCanvas();
            this.renderRecords(model.records);
        },

        render: function (model, particles) {
            this.ctx.fillStyle = "#05070f";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawGrid(model.cell, model.cols);
            this.drawApple(model.apple, model.cell);
            this.drawSnake(model.snake, model.direction, model.cell);
            this.drawParticles(particles);
        },

        clearCanvas: function () {
            this.ctx.fillStyle = "#05070f";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawGrid: function (cell, cols) {
            this.ctx.strokeStyle = "rgba(57, 255, 20, 0.06)";
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= cols; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(i * cell, 0);
                this.ctx.lineTo(i * cell, this.canvas.height);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * cell);
                this.ctx.lineTo(this.canvas.width, i * cell);
                this.ctx.stroke();
            }
        },

        drawApple: function (apple, cell) {
            const cx = apple.x * cell + cell / 2;
            const cy = apple.y * cell + cell / 2;
            const r = cell / 2 - 3;
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.12;

            this.ctx.save();
            this.ctx.shadowColor = "#ff2d95";
            this.ctx.shadowBlur = 22;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = "#ff2d95";
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r * pulse * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            this.ctx.fill();
            this.ctx.restore();
        },

        drawSnake: function (snake, direction, cell) {
            for (let i = snake.length - 1; i >= 0; i--) {
                const seg = snake[i];
                const x = seg.x * cell;
                const y = seg.y * cell;
                const pad = 2;
                const isHead = i === 0;
                const t = i / Math.max(snake.length - 1, 1);
                const r = Math.round(57 + (0 - 57) * t);
                const g = Math.round(255 + (229 - 255) * t);
                const b = Math.round(20 + (255 - 20) * t);

                this.ctx.save();
                if (isHead) { this.ctx.shadowColor = "#39ff14"; this.ctx.shadowBlur = 20; }
                else { this.ctx.shadowColor = "#00e5ff"; this.ctx.shadowBlur = 8; }
                
                this.ctx.beginPath();
                this.roundRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2, isHead ? 6 : 5);
                this.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                this.ctx.fill();
                this.ctx.restore();
            }
            this.drawEyes(snake[0], direction, cell);
        },

        drawEyes: function (head, direction, cell) {
            if (!head) return;
            const x = head.x * cell;
            const y = head.y * cell;
            const size = 3;
            const off = 5;
            let e1x, e1y, e2x, e2y;

            if (direction.x === 1) { e1x = x + cell - off; e1y = y + off; e2x = x + cell - off; e2y = y + cell - off; }
            else if (direction.x === -1) { e1x = x + off; e1y = y + off; e2x = x + off; e2y = y + cell - off; }
            else if (direction.y === -1) { e1x = x + off; e1y = y + off; e2x = x + cell - off; e2y = y + off; }
            else { e1x = x + off; e1y = y + cell - off; e2x = x + cell - off; e2y = y + cell - off; }

            this.ctx.save();
            this.ctx.fillStyle = "#05070f";
            this.ctx.beginPath();
            this.ctx.arc(e1x, e1y, size, 0, Math.PI * 2);
            this.ctx.arc(e2x, e2y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        },

        drawParticles: function (particles) {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(p.life, 0);
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 12;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        },

        roundRect: function (x, y, w, h, r) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + r, y);
            this.ctx.arcTo(x + w, y, x + w, y + h, r);
            this.ctx.arcTo(x + w, y + h, x, y + h, r);
            this.ctx.arcTo(x, y + h, x, y, r);
            this.ctx.arcTo(x, y, x + w, y, r);
            this.ctx.closePath();
        },

        updateHUD: function (score, length, highScore) {
            this.elements.score.textContent = score;
            this.elements.length.textContent = length;
            this.elements.highScore.textContent = highScore;
        },

        showMenuScreen: function (records) {
            this.elements.game.classList.add("hidden");
            this.elements.menu.classList.remove("hidden");
            this.renderRecords(records);
        },

        showGameScreen: function () {
            this.elements.menu.classList.add("hidden");
            this.elements.game.classList.remove("hidden");
            this.elements.overlayPause.classList.add("hidden");
            this.elements.overlayGameover.classList.add("hidden");
        },

        showGameOver: function (finalScore, finalLength) {
            this.elements.finalScore.textContent = finalScore;
            this.elements.finalLength.textContent = finalLength;
            this.elements.overlayGameover.classList.remove("hidden");
        },

        togglePauseOverlay: function (isPaused) {
            if (isPaused) this.elements.overlayPause.classList.remove("hidden");
            else this.elements.overlayPause.classList.add("hidden");
        },

        renderRecords: function (records) {
            this.elements.recordsList.innerHTML = "";
            if (records.length === 0) {
                const li = document.createElement("li");
                li.className = "empty";
                li.textContent = "Пока нет рекордов";
                this.elements.recordsList.appendChild(li);
                return;
            }

            records.forEach(function (r, i) {
                const li = document.createElement("li");
                const place = document.createElement("span");
                place.className = "place";
                if (i === 0) place.classList.add("gold");
                else if (i === 1) place.classList.add("silver");
                else if (i === 2) place.classList.add("bronze");
                place.textContent = "#" + (i + 1);

                const sc = document.createElement("span");
                sc.className = "score-val";
                sc.textContent = r.score;

                const dt = document.createElement("span");
                dt.className = "date-val";
                dt.textContent = r.date || "";

                li.appendChild(place);
                li.appendChild(sc);
                li.appendChild(dt);
                this.elements.recordsList.appendChild(li);
            }, this);
        }
    };

    window.SnakeView = View;
})();