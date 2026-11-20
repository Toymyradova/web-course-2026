const API_URL = 'http://localhost:3001';

export async function getCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Ошибка загрузки категорий');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions?_sort=date&_order=desc`);
        if (!response.ok) throw new Error('Ошибка загрузки операций');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
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
        console.error(error);
        throw error;
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
        console.error(error);
        throw error;
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
        console.error(error);
        throw error;
    }
}