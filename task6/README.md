# Задание 6 — Игра «Змейка» на Canvas (Neon Edition)

**Что сделано:**
- Классическая «Змейка» на Canvas 400×400.
- Стартовое меню с логотипом, названием, техбейджами.
- Таблица рекордов (топ-5) с датами, хранится в localStorage.
- Кнопки «Новая игра», «Меню», «Пауза», «Продолжить», «Очистить рекорды».
- Управление стрелками, Space — пауза, R — заново.
- Частицы, звуки (AudioContext), неоновая тема.
- Игровой цикл через `requestAnimationFrame`, постоянная скорость через `deltaTime` (140мс).
- Логика (`update`, `moveSnake`, `checkCollision`) и отрисовка (`draw`, `drawSnake`, `drawApple`) разделены.
- Код разбит на функции: `spawnApple`, `createParticles`, `drawEyes`, `renderRecords`, `addRecord` и др.

**Файлы:**
- `index.html`, `style.css`, `script.js`

**Как запустить:**
https://toymyradova.github.io/web-course-2026/task6/