(function () {
    "use strict"; // Включаем строгий режим для защиты от ошибок

    const MOVE_INTERVAL = 220;

    const Controller = {
        model: null,
        view: null,
        particles: [],    // Массив для хранения частиц (эффектов взрыва)
        lastMoveTime: 0,  // Время последнего шага змейки
        rafId: null,      // ID для requestAnimationFrame (чтобы можно было остановить)
        audioCtx: null,   // Аудио-контекст для звуков

        // 1. Инициализация: связываем Model и View
        init: function (model, view) {
            this.model = model;
            this.view = view;

            // Загружаем рекорды из localStorage и передаем их во View
            this.model.loadRecords();
            // Даем View ссылку на Model, чтобы он мог отрисовать canvas и меню
            this.view.init(this.model);

            // Привязываем события (клики, клавиатура)
            this.bindEvents();
        },

        // 2. Привязка всех событий
        bindEvents: function () {
            const self = this; // Сохраняем this, чтобы использовать внутри функций

             //Кнопки меню и игры
            document.getElementById("new-game-btn").addEventListener("click", function () { self.startGame(); });
            document.getElementById("back-to-menu-btn").addEventListener("click", function () { self.showMenu(); });
            document.getElementById("to-menu-btn").addEventListener("click", function () { self.showMenu(); });
            document.getElementById("restart-btn").addEventListener("click", function () { self.startGame(); });
            
            //пауза
            document.getElementById("pause-btn").addEventListener("click", function () { self.togglePause(); });
            document.getElementById("resume-btn").addEventListener("click", function () { self.togglePause(); });

            //Очистка рекордов
            document.getElementById("clear-records-btn").addEventListener("click", function () {
                if (confirm("Удалить все рекорды?")) {
                    const recs = self.model.clearRecords();
                    self.view.renderRecords(recs);
                }
            });

            //Управление клавиатурой (стрелки и пробел)
            document.addEventListener("keydown", function (e) {
                const k = e.key;
                if (k === "ArrowUp")    { self.model.setDirection("up");    e.preventDefault(); }
                if (k === "ArrowDown")  { self.model.setDirection("down");  e.preventDefault(); }
                if (k === "ArrowLeft")  { self.model.setDirection("left");  e.preventDefault(); }
                if (k === "ArrowRight") { self.model.setDirection("right"); e.preventDefault(); }
                if (k === " " || k === "Spacebar") { self.togglePause(); e.preventDefault(); }
            });

            //Управление для мобильных (кнопки на экране)
            document.querySelectorAll(".touch-btn").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    self.model.setDirection(btn.dataset.dir);
                });
            });
        },

        // 3. Запуск / перезапуск игры
        startGame: function () {
            this.initAudio();       // Включаем звук (если браузер разрешает)
            this.model.reset();     // Сбрасываем змейку, яблоко, счет
            this.particles = [];    // Очищаем старые частицы
            this.lastMoveTime = 0;

            this.view.showGameScreen();  // Показываем игровой экран
            
            // Обновляем HUD (счет, длину, рекорд)
            const highScore = this.model.records.length > 0 ? this.model.records[0].score : 0;
            this.view.updateHUD(this.model.score, this.model.snake.length, highScore);

            // Останавливаем старый цикл анимации, если он был
            if (this.rafId) cancelAnimationFrame(this.rafId);
            // Запускаем новый игровой цикл
            this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
        },

        // 4. Возврат в главное меню
        showMenu: function () {
            if (this.rafId) cancelAnimationFrame(this.rafId); // Останавливаем игру
            this.rafId = null;
            this.view.showMenuScreen(this.model.records); // Показываем меню с рекордами
        },

        // 5. Пауза / Продолжение
        togglePause: function () {
            const isPaused = this.model.togglePause(); // Меняем статус в Модели
            this.view.togglePauseOverlay(isPaused);    // Показываем/скрываем оверлей паузы
            if (!isPaused) {
                this.lastMoveTime = 0; // Сбрасываем таймер, чтобы змейка не прыгнула
                this.rafId = requestAnimationFrame(this.gameLoop.bind(this)); // Возобновляем цикл
            }
        },

        // 6. Главный игровой цикл (вызывается ~60 раз в секунду)
        gameLoop: function (currentTime) {
            if (!this.lastMoveTime) this.lastMoveTime = currentTime;
            const delta = currentTime - this.lastMoveTime; // Сколько времени прошло

            // Двигаем змейку ТОЛЬКО если прошло достаточно времени (MOVE_INTERVAL)
            if (delta >= MOVE_INTERVAL) {
                const result = this.model.move();  // Просим Модель сделать шаг
                
                if (result.moved) {
                    this.updateParticles(); // Обновляем частицы
                    this.view.updateHUD(this.model.score, this.model.snake.length, this.getHighScore());

                    // Если съели яблоко — создаем эффект и звук
                    if (result.ateApple) {
                        this.createParticles(this.model.apple.x, this.model.apple.y, "#ff2d95"); 
                        this.playTone(880, 0.08, "square", 0.06);
                    }
                    // Если врезались — конец игры
                    if (result.dead) {
                        this.handleGameOver();
                        return; // Останавливаем цикл
                    }
                }
                this.lastMoveTime = currentTime; // Запоминаем время шага
            }

            this.view.render(this.model, this.particles); // Рисуем кадр
            
            if (!this.model.gameOver) {
                this.rafId = requestAnimationFrame(this.gameLoop.bind(this)); // Продолжаем цикл
            }
        },

        // 7. Обработка проигрыша
        handleGameOver: function () {
            // Взрыв частиц в месте головы змейки
            this.createParticles(this.model.snake[0].x, this.model.snake[0].y, "#ff3b3b");
            this.playTone(120, 0.4, "sawtooth", 0.08); // Звук проигрыша
            
            this.model.addRecord(); // Сохраняем рекорд в localStorage
            this.view.showGameOver(this.model.score, this.model.snake.length); // Показываем экран Game Over
        },

        // 8. Получить текущий рекорд
        getHighScore: function () {
            return this.model.records.length > 0 ? this.model.records[0].score : 0;
        },

        // 9. Создание частиц (для эффекта взрыва)
        createParticles: function (cx, cy, color) {
            // Переводим координаты клетки в пиксели
            const px = cx * this.model.cell + this.model.cell / 2;
            const py = cy * this.model.cell + this.model.cell / 2;
            for (let i = 0; i < 14; i++) {
                const angle = (Math.PI * 2 * i) / 14; // Распределяем частицы по кругу
                const speed = 1.5 + Math.random() * 2;
                this.particles.push({
                    x: px, y: py,
                    vx: Math.cos(angle) * speed, // Скорость по X
                    vy: Math.sin(angle) * speed, // Скорость по Y
                    life: 1, color: color,
                    size: 2 + Math.random() * 2
                });
            }
        },

         // 10. Обновление частиц (движение и затухание)
        updateParticles: function () {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx; p.y += p.vy;     // Двигаем
                p.vx *= 0.94; p.vy *= 0.94;   // Замедляем (трение)
                p.life -= 0.03;               // Уменьшаем жизнь
                if (p.life <= 0) this.particles.splice(i, 1); // Удаляем мертвые частицы
            }
        },

        // 11. Инициализация звука
        initAudio: function () {
            if (!this.audioCtx) {
                try {
                    // Создаем аудио-контекст (только после клика пользователя)
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) { this.audioCtx = null; }
            }
        },

        // 12. Воспроизведение звука
        playTone: function (freq, duration, type, volume) {
            if (!this.audioCtx) return;
            try {
                const osc = this.audioCtx.createOscillator(); // Создаем генератор частоты
                const gain = this.audioCtx.createGain(); // Создаем регулятор громкости
                osc.type = type || "square"; // Тип волны (квадратная)
                osc.frequency.value = freq; // Частота звука
                gain.gain.setValueAtTime(volume || 0.05, this.audioCtx.currentTime); // Громкость
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration); // Плавное затухание
                osc.connect(gain); // Подключаем генератор к громкости
                gain.connect(this.audioCtx.destination); // Подключаем к динамикам
                osc.start(); // Включаем звук
                osc.stop(this.audioCtx.currentTime + duration); // Выключаем через время
            } catch (e) {}
        }
    };
    // Запуск после загрузки страницы
    document.addEventListener("DOMContentLoaded", function () {
        // Передаем Модель и View в Контроллер
        Controller.init(window.SnakeModel, window.SnakeView);
    });
})();