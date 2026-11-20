// Нужна, чтобы переменные внутри не попадали в глобальную область видимости
(function () {
    "use strict"; // Строгий режим: запрещает неявные ошибки

    // --- САМО VIEW (Глаза и руки игры) ---
    // View отвечает ТОЛЬКО за отрисовку (Canvas и HTML). 
    // Он не знает правил игры и не хранит данные.
    const View = {
        canvas: null,   // Ссылка на HTML-элемент <canvas>
        ctx: null,      // "Кисточка" для рисования 2D-графики
        elements: {},   // Объект, куда мы сохраним все найденные HTML-элементы

        // 1. Инициализация: находим элементы и готовим холст
        init: function (model) {
            // Находим canvas и получаем контекст для рисования
            this.canvas = document.getElementById("game-canvas");
            this.ctx = this.canvas.getContext("2d");

            // Ищем все нужные элементы интерфейса по их id и сохраняем в объект
            this.elements = {
                menu: document.getElementById("menu-screen"),       // Главное меню
                game: document.getElementById("game-screen"),       // Игровой экран
                score: document.getElementById("score"),            // Текущий счёт
                highScore: document.getElementById("high-score"),   // Рекорд
                length: document.getElementById("length"),          // Длина змейки
                overlayPause: document.getElementById("overlay-pause"),       // Экран паузы
                overlayGameover: document.getElementById("overlay-gameover"), // Экран Game Over
                finalScore: document.getElementById("final-score"), // Финальный счёт в Game Over
                finalLength: document.getElementById("final-length"),// Финальная длина в Game Over
                recordsList: document.getElementById("records-list") // Список рекордов в меню
            };

            // Очищаем холст от белого фона (делаем темным)
            this.clearCanvas();
            // Отрисовываем таблицу рекордов (данные пришли из Model)
            this.renderRecords(model.records);
        },

        // 2. Главная функция отрисовки кадра (вызывается Контроллером ~60 раз в секунду)
        render: function (model, particles) {
            // Заливаем весь холст темным цветом, чтобы стереть предыдущий кадр
            this.ctx.fillStyle = "#05070f";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Вызываем вспомогательные функции для отрисовки каждого слоя
            // Порядок важен: сетка сзади, частицы спереди
            this.drawGrid(model.cell, model.cols);       // Рисуем сетку
            this.drawApple(model.apple, model.cell);     // Рисуем яблоко
            this.drawSnake(model.snake, model.direction, model.cell); // Рисуем змейку
            this.drawParticles(particles);               // Рисуем частицы (взрывы)
        },

        // Вспомогательная функция: очистить холст (залить темным цветом)
        clearCanvas: function () {
            this.ctx.fillStyle = "#05070f";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        // 3. Отрисовка сетки на Canvas
        drawGrid: function (cell, cols) {
            // Цвет сетки: зеленоватый, полупрозрачный
            this.ctx.strokeStyle = "rgba(57, 255, 20, 0.06)";
            this.ctx.lineWidth = 1;
            
            // Цикл от 0 до количества колонок
            for (let i = 0; i <= cols; i++) {
                // Рисуем вертикальную линию
                this.ctx.beginPath();
                this.ctx.moveTo(i * cell, 0); // Начало линии (верх)
                this.ctx.lineTo(i * cell, this.canvas.height); // Конец линии (низ)
                this.ctx.stroke();

                // Рисуем горизонтальную линию
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * cell); // Начало (лево)
                this.ctx.lineTo(this.canvas.width, i * cell); // Конец (право)
                this.ctx.stroke();
            }
        },

        // 4. Отрисовка яблока (с пульсацией и свечением)
        drawApple: function (apple, cell) {
            // Вычисляем центр клетки в пикселях
            const cx = apple.x * cell + cell / 2;
            const cy = apple.y * cell + cell / 2;
            // Радиус яблока (чуть меньше клетки)
            const r = cell / 2 - 3;
            // Эффект пульсации: используем Math.sin, чтобы радиус плавно менялся
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.12;

            this.ctx.save(); // Сохраняем настройки (чтобы свечение не влияло на другие элементы)
            this.ctx.shadowColor = "#ff2d95"; // Цвет свечения (розовый)
            this.ctx.shadowBlur = 22;        // Сила размытия свечения

            // Рисуем основное яблоко (розовый круг)
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = "#ff2d95";
            this.ctx.fill();

            // Рисуем блик внутри яблока (белый полупрозрачный круг)
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r * pulse * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            this.ctx.fill();
            
            this.ctx.restore(); // Восстанавливаем настройки
        },

        // 5. Отрисовка змейки
        drawSnake: function (snake, direction, cell) {
            // Идем с конца (хвоста) к началу (голове), чтобы голова была поверх хвоста
            for (let i = snake.length - 1; i >= 0; i--) {
                const seg = snake[i];       // Координаты сегмента
                const x = seg.x * cell;     // Пиксели по X
                const y = seg.y * cell;     // Пиксели по Y
                const pad = 2;              // Отступ внутри клетки (чтобы были зазоры)
                const isHead = i === 0;     // Это голова?

                // Вычисляем коэффициент от 0 до 1 для градиента
                const t = i / Math.max(snake.length - 1, 1);
                
                // Градиент: голова (зеленая) -> хвост (голубая)
                const r = Math.round(57 + (0 - 57) * t);
                const g = Math.round(255 + (229 - 255) * t);
                const b = Math.round(20 + (255 - 20) * t);

                this.ctx.save(); // Сохраняем настройки
                
                // Настраиваем неоновое свечение
                if (isHead) { 
                    this.ctx.shadowColor = "#39ff14"; // Голова светится ярко-зеленым
                    this.ctx.shadowBlur = 20; 
                } else { 
                    this.ctx.shadowColor = "#00e5ff"; // Хвост светится голубым
                    this.ctx.shadowBlur = 8; 
                }
                
                // Рисуем сегмент (закругленный квадрат)
                this.ctx.beginPath();
                this.roundRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2, isHead ? 6 : 5);
                this.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"; // Применяем цвет градиента
                this.ctx.fill();
                this.ctx.restore();
            }
            // После отрисовки тела рисуем глазки на голове
            this.drawEyes(snake[0], direction, cell);
        },

        // 6. Отрисовка глазок змейки (чтобы знать, куда она смотрит)
        drawEyes: function (head, direction, cell) {
            if (!head) return; // Защита, если головы нет

            const x = head.x * cell;
            const y = head.y * cell;
            const size = 3; // Размер глаза
            const off = 5;  // Отступ от края
            let e1x, e1y, e2x, e2y;

            // В зависимости от направления движения располагаем глаза
            if (direction.x === 1) { // Вправо
                e1x = x + cell - off; e1y = y + off; 
                e2x = x + cell - off; e2y = y + cell - off; 
            }
            else if (direction.x === -1) { // Влево
                e1x = x + off; e1y = y + off; 
                e2x = x + off; e2y = y + cell - off; 
            }
            else if (direction.y === -1) { // Вверх
                e1x = x + off; e1y = y + off; 
                e2x = x + cell - off; e2y = y + off; 
            }
            else { // Вниз
                e1x = x + off; e1y = y + cell - off; 
                e2x = x + cell - off; e2y = y + cell - off; 
            }

            this.ctx.save();
            this.ctx.fillStyle = "#05070f"; // Цвет глаз (темный, как фон)
            this.ctx.beginPath();
            this.ctx.arc(e1x, e1y, size, 0, Math.PI * 2);
            this.ctx.arc(e2x, e2y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        },

        // 7. Отрисовка частиц (эффект взрыва)
        drawParticles: function (particles) {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]; // Берем одну частицу
                this.ctx.save();
                // Делаем частицу прозрачной по мере умирания (life от 1 до 0)
                this.ctx.globalAlpha = Math.max(p.life, 0);
                this.ctx.shadowColor = p.color; // Свечение цвета частицы
                this.ctx.shadowBlur = 12;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        },

        // 8. Вспомогательная функция: рисование прямоугольника с закругленными углами
        roundRect: function (x, y, w, h, r) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + r, y);
            this.ctx.arcTo(x + w, y, x + w, y + h, r);
            this.ctx.arcTo(x + w, y + h, x, y + h, r);
            this.ctx.arcTo(x, y + h, x, y, r);
            this.ctx.arcTo(x, y, x + w, y, r);
            this.ctx.closePath();
        },

        // 9. Обновление цифр на экране (Счёт, Длина, Рекорд)
        updateHUD: function (score, length, highScore) {
            this.elements.score.textContent = score;
            this.elements.length.textContent = length;
            this.elements.highScore.textContent = highScore;
        },

        // 10. Показать главное меню
        showMenuScreen: function (records) {
            this.elements.game.classList.add("hidden");   // Скрываем игру
            this.elements.menu.classList.remove("hidden"); // Показываем меню
            this.renderRecords(records);                  // Обновляем таблицу рекордов
        },

        // 11. Показать игровой экран
        showGameScreen: function () {
            this.elements.menu.classList.add("hidden");           // Скрываем меню
            this.elements.game.classList.remove("hidden");        // Показываем игру
            this.elements.overlayPause.classList.add("hidden");   // Скрываем паузу
            this.elements.overlayGameover.classList.add("hidden");// Скрываем Game Over
        },

        // 12. Показать экран "Игра Окончена"
        showGameOver: function (finalScore, finalLength) {
            this.elements.finalScore.textContent = finalScore;
            this.elements.finalLength.textContent = finalLength;
            this.elements.overlayGameover.classList.remove("hidden"); // Показываем окно
        },

        // 13. Показать / скрыть экран паузы
        togglePauseOverlay: function (isPaused) {
            if (isPaused) this.elements.overlayPause.classList.remove("hidden");
            else this.elements.overlayPause.classList.add("hidden");
        },

        // 14. Отрисовка таблицы рекордов в меню
        renderRecords: function (records) {
            this.elements.recordsList.innerHTML = ""; // Очищаем список
            
            // Если рекордов нет, пишем сообщение
            if (records.length === 0) {
                const li = document.createElement("li");
                li.className = "empty";
                li.textContent = "Пока нет рекордов";
                this.elements.recordsList.appendChild(li);
                return;
            }

            // Перебираем все рекорды
            records.forEach(function (r, i) {
                const li = document.createElement("li");

                // Место (1, 2, 3...)
                const place = document.createElement("span");
                place.className = "place";
                if (i === 0) place.classList.add("gold");   // 1 место - золото
                else if (i === 1) place.classList.add("silver"); // 2 место - серебро
                else if (i === 2) place.classList.add("bronze"); // 3 место - бронза
                place.textContent = "#" + (i + 1);

                // Очки
                const sc = document.createElement("span");
                sc.className = "score-val";
                sc.textContent = r.score;

                // Дата
                const dt = document.createElement("span");
                dt.className = "date-val";
                dt.textContent = r.date || "";

                // Собираем всё в один <li> и добавляем в список
                li.appendChild(place);
                li.appendChild(sc);
                li.appendChild(dt);
                this.elements.recordsList.appendChild(li);
            }, this);
        }
    };

    // Экспортируем View наружу, чтобы Controller мог его использовать
    window.SnakeView = View;
})();