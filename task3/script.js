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
    tasks.push({ id: nextId, text: text, completed: false });
    nextId = nextId + 1;
    input.value = "";
    render();
}

function toggleTask(id) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks[i].completed = !tasks[i].completed;
        }
    }
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(function(t) { return t.id !== id; });
    render();
}

function render() {
    list.innerHTML = "";

    let filtered = tasks;
    if (currentFilter === "active") {
        filtered = tasks.filter(function(t) { return t.completed === false; });
    } else if (currentFilter === "completed") {
        filtered = tasks.filter(function(t) { return t.completed === true; });
    }

    filtered.forEach(function(task) {
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
        toggleBtn.addEventListener("click", function() { toggleTask(task.id); });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "🗑";
        deleteBtn.addEventListener("click", function() { deleteTask(task.id); });

        li.appendChild(span);
        li.appendChild(toggleBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    let total = tasks.length;
    let done = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].completed === true) {
            done = done + 1;
        }
    }
    let left = total - done;
    counter.textContent = "Осталось: " + left + ", Выполнено: " + done;
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

filterBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        render();
    });
});

render();