const API_URL = 'http://localhost:3001';

const FALLBACK_CATEGORIES = [
    { id: 1, name: "Еда", type: "expense" },
    { id: 2, name: "Зарплата", type: "income" },
    { id: 3, name: "Развлечения", type: "expense" },
    { id: 4, name: "Фриланс", type: "income" }
];

export async function getCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Ошибка загрузки');
        return await response.json();
    } catch (error) {
        console.warn("Сервер недоступен, берем локальные категории.");
        return FALLBACK_CATEGORIES;
    }
}

export async function getTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions?_sort=date&_order=desc`);
        if (!response.ok) throw new Error('Ошибка загрузки');
        return await response.json();
    } catch (error) {
        console.warn("Сервер недоступен, берем операции из памяти.");
        const local = localStorage.getItem('zen-money-data');
        return local ? JSON.parse(local) : [];
    }
}

export async function addTransaction(data) {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка добавления');
        return await response.json();
    } catch (error) {
        const local = await getTransactions();
        data.id = Date.now();
        local.unshift(data);
        localStorage.setItem('zen-money-data', JSON.stringify(local));
        return data;
    }
}

export async function updateTransaction(id, data) {
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка обновления');
        return await response.json();
    } catch (error) {
        let local = await getTransactions();
        local = local.map(t => t.id === Number(id) ? { ...data, id: Number(id) } : t);
        localStorage.setItem('zen-money-data', JSON.stringify(local));
        return data;
    }
}

export async function deleteTransaction(id) {
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ошибка удаления');
        return true;
    } catch (error) {
        let local = await getTransactions();
        local = local.filter(t => t.id !== Number(id));
        localStorage.setItem('zen-money-data', JSON.stringify(local));
        return true;
    }
}