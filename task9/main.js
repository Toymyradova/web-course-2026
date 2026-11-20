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
    
    categoryForm: document.getElementById('category-form'),
    newCategoryInput: document.getElementById('new-category'),
    newCategoryType: document.getElementById('new-category-type'),
    
    list: document.getElementById('transactions-list'),
    income: document.getElementById('total-income'),
    expense: document.getElementById('total-expense'),
    balance: document.getElementById('total-balance'),
    error: document.getElementById('error'),
    
    filterType: document.getElementById('filter-type'),
    filterCategory: document.getElementById('filter-category'),
    filterDateFrom: document.getElementById('filter-date-from'),
    filterDateTo: document.getElementById('filter-date-to'),
    resetFiltersBtn: document.getElementById('reset-filters')
};

let allTransactions = [];
let allCategories = [];

async function init() {
    elements.date.valueAsDate = new Date();
    loadSettings();
    await loadData();
    bindEvents();
}

function loadSettings() {
    const savedType = localStorage.getItem('zen-filter-type');
    const savedCategory = localStorage.getItem('zen-filter-category');
    const savedFrom = localStorage.getItem('zen-filter-from');
    const savedTo = localStorage.getItem('zen-filter-to');

    if (savedType) elements.filterType.value = savedType;
    if (savedFrom) elements.filterDateFrom.value = savedFrom;
    if (savedTo) elements.filterDateTo.value = savedTo;
    
    if (savedCategory) elements.filterCategory.dataset.savedValue = savedCategory;
}

function saveSettings() {
    localStorage.setItem('zen-filter-type', elements.filterType.value);
    localStorage.setItem('zen-filter-category', elements.filterCategory.value);
    localStorage.setItem('zen-filter-from', elements.filterDateFrom.value);
    localStorage.setItem('zen-filter-to', elements.filterDateTo.value);
}

async function loadData() {
    try {
        allCategories = await api.getCategories();
        allTransactions = await api.getTransactions();

        ui.renderCategories(allCategories, elements.category, elements.filterCategory);

        const savedCat = elements.filterCategory.dataset.savedValue;
        if (savedCat) elements.filterCategory.value = savedCat;

        applyFilters();
    } catch (error) {
        ui.showError('Не удалось подключиться к серверу.', elements.error);
    }
}

function applyFilters() {
    const type = elements.filterType.value;
    const category = elements.filterCategory.value;
    const fromDate = elements.filterDateFrom.value;
    const toDate = elements.filterDateTo.value;

    let filtered = allTransactions;

    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }
    if (fromDate) {
        filtered = filtered.filter(t => t.date >= fromDate);
    }
    if (toDate) {
        filtered = filtered.filter(t => t.date <= toDate);
    }

    ui.renderTransactions(filtered, elements.list, handleEdit, handleDelete);
    ui.renderBalance(filtered, elements.income, elements.expense, elements.balance);
    
    saveSettings(); 
}

function validateForm() {
    const amount = elements.amount.value;
    const category = elements.category.value;
    const date = elements.date.value;

    if (!amount || Number(amount) <= 0) {
        ui.showError('Сумма должна быть положительным числом!', elements.error);
        elements.amount.style.borderColor = '#ef4444';
        return false;
    }
    if (!category) {
        ui.showError('Выберите категорию!', elements.error);
        elements.category.style.borderColor = '#ef4444';
        return false;
    }
    if (!date) {
        ui.showError('Укажите дату!', elements.error);
        elements.date.style.borderColor = '#ef4444';
        return false;
    }

    elements.amount.style.borderColor = '';
    elements.category.style.borderColor = '';
    elements.date.style.borderColor = '';
    return true;
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const id = elements.idInput.value;
    const data = {
        amount: Number(elements.amount.value),
        type: elements.type.value,
        category: elements.category.value,
        date: elements.date.value,
        comment: elements.comment.value.trim()
    };

    try {
        if (id) await api.updateTransaction(id, data);
        else await api.addTransaction(data);
        resetForm();
        await loadData();
    } catch (error) {
        ui.showError('Ошибка при сохранении', elements.error);
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const name = elements.newCategoryInput.value.trim();
    const type = elements.newCategoryType.value;

    if (!name) return;

    try {
        await fetch('http://localhost:3001/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type })
        });
        
        elements.newCategoryInput.value = '';
        await loadData(); 
    } catch (error) {
        ui.showError('Ошибка при создании категории', elements.error);
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
    elements.amount.style.borderColor = '';
    elements.category.style.borderColor = '';
}

function bindEvents() {
    elements.form.addEventListener('submit', handleSubmit);
    elements.cancelBtn.addEventListener('click', resetForm);
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);

    elements.filterType.addEventListener('change', applyFilters);
    elements.filterCategory.addEventListener('change', applyFilters);
    elements.filterDateFrom.addEventListener('change', applyFilters);
    elements.filterDateTo.addEventListener('change', applyFilters);
    
    elements.resetFiltersBtn.addEventListener('click', () => {
        elements.filterType.value = 'all';
        elements.filterCategory.value = 'all';
        elements.filterDateFrom.value = '';
        elements.filterDateTo.value = '';
        applyFilters();
    });
}

document.addEventListener('DOMContentLoaded', init);