let tasks = [];
let currentFilter = "all";
let nextId = 1;

const input = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const filterBtns = document.querySelectorAll(".filter-btn");

function addTask() {
    const text = input.value.trim();

    if (text === "") {
        alert("Введите задачу!");
        return;
    }

    const newTask = {
        id: nextId++,
        text: text,
        completed: false
    };

    tasks.push(newTask);

    input.value = "";
    input.focus();

    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    render();
}

function updateCounter() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    counter.textContent = Осталось: ${remaining}, Выполнено: ${completed};
}

function render() {
    list.innerHTML = "";

    let filtered = tasks;
    if (currentFilter === "active") {
        filtered = tasks.filter(t => !t.completed);
    } else if (currentFilter === "completed") {
        filtered = tasks.filter(t => t.completed);
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        if (task.completed) {
            li.classList.add("completed");
        }

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "toggle-btn";
        toggleBtn.textContent = task.completed ? "↩" : "✓";
        toggleBtn.addEventListener("click", () => toggleTask(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "🗑";
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        li.appendChild(span);
        li.appendChild(toggleBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    updateCounter();
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render();
    });
});

render();