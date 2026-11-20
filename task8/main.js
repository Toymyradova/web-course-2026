import * as api from './api.js';
import * as ui from './ui.js';

const elements = {
    form: document.getElementById('transaction-form'),
    formTitle: document.getElementById('form-title'),
    idInput: document.getElementById('transaction-id'),
    amount: document.getElementById('amount'),
    type: document.getElementById('type'),
    category: document.getElementById('category'),
    date: document.getElementById('date'),
    comment: document.getElementById('comment'),
    submitBtn: document.getElementById('submit-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    list: document.getElementById('transactions-list'),
    income: document.getElementById('total-income'),
    expense: document.getElementById('total-expense'),
    balance: document.getElementById('total-balance'),
    error: document.getElementById('error'),
    loader: document.getElementById('loader')
};

let allTransactions = [];

async function init() {
    elements.date.valueAsDate = new Date();
    await loadData();
    bindEvents();
}

async function loadData() {
    try {
        elements.loader.classList.remove('hidden');
        
        const [categories, transactions] = await Promise.all([
            api.getCategories(),
            api.getTransactions()
        ]);

        ui.renderCategories(categories, elements.category);
        allTransactions = transactions;
        
        updateUI();
        elements.loader.classList.add('hidden');

    } catch (error) {
        elements.loader.classList.add('hidden');
        ui.showError('Не удалось подключиться к серверу. Запущен ли json-server?', elements.error);
    }
}

function updateUI() {
    ui.renderTransactions(allTransactions, elements.list, handleEdit, handleDelete);
    ui.renderBalance(allTransactions, elements.income, elements.expense, elements.balance);
}

async function handleSubmit(e) {
    e.preventDefault();

    const id = elements.idInput.value;
    const data = {
        amount: Number(elements.amount.value),
        type: elements.type.value,
        category: elements.category.value,
        date: elements.date.value,
        comment: elements.comment.value.trim()
    };

    try {
        if (id) {
            await api.updateTransaction(id, data);
        } else {
            await api.addTransaction(data);
        }
        resetForm();
        await loadData();
    } catch (error) {
        ui.showError('Ошибка при сохранении', elements.error);
    }
}

function handleEdit(transaction) {
    elements.formTitle.textContent = "Редактировать операцию";
    elements.submitBtn.textContent = "Сохранить";
    elements.cancelBtn.classList.remove('hidden');

    elements.idInput.value = transaction.id;
    elements.amount.value = transaction.amount;
    elements.type.value = transaction.type;
    elements.category.value = transaction.category;
    elements.date.value = transaction.date;
    elements.comment.value = transaction.comment || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDelete(id) {
    if (!confirm('Удалить эту операцию?')) return;
    try {
        await api.deleteTransaction(id);
        await loadData();
    } catch (error) {
        ui.showError('Ошибка при удалении', elements.error);
    }
}

function resetForm() {
    elements.form.reset();
    elements.date.valueAsDate = new Date();
    elements.idInput.value = '';
    elements.formTitle.textContent = "Новая операция";
    elements.submitBtn.textContent = "Добавить";
    elements.cancelBtn.classList.add('hidden');
}

function bindEvents() {
    elements.form.addEventListener('submit', handleSubmit);
    elements.cancelBtn.addEventListener('click', resetForm);
}

document.addEventListener('DOMContentLoaded', init);